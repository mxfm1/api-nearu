#!/usr/bin/env npx ts-node

/**
 * Database Schema Audit Script
 * 
 * Checks schema.ts for common issues:
 * 1. Free-text columns for structured data (status, type, state)
 * 2. Missing foreign key references
 * 3. Missing cascade deletes
 */

import * as schema from '../src/shared/database/schema';
import { pgTable, text, pgEnum } from 'drizzle-orm';

// Find all pgTable definitions
function findTables(obj: any, visited = new Set()): any[] {
  if (visited.has(obj)) return [];
  visited.add(obj);
  
  const tables: any[] = [];
  
  if (obj && typeof obj === 'object') {
    if (obj.$type === 'table' || obj.tableName) {
      tables.push(obj);
    }
    for (const key of Object.keys(obj)) {
      if (key === 'prototype') continue;
      const result = findTables(obj[key], visited);
      tables.push(...result);
    }
  }
  
  return tables;
}

interface Issue {
  type: 'FREE_TEXT_STATUS' | 'MISSING_FK' | 'MISSING_CASCADE' | 'FREE_TEXT_TYPE';
  table: string;
  column: string;
  line?: number;
  severity: 'ERROR' | 'WARNING';
  message: string;
  fix: string;
}

const KNOWN_LOOKUP_TABLES = ['statuses', 'categories', 'regions', 'locations', 'tags'];
const FREE_TEXT_PATTERNS = ['status', 'type', 'state', 'role', 'category'];

function auditSchema() {
  const issues: Issue[] = [];
  
  // Read the schema file
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, '../src/shared/database/schema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const lines = content.split('\n');
  
  // Pattern to detect text columns without references
  const textColumnWithoutRef = /(\w+):\s*text\(['"]([\w_]+)['"]\)/g;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for free-text status/type fields
    for (const pattern of FREE_TEXT_PATTERNS) {
      // Match: fieldName: text('field_name') or fieldName: text("field_name")
      const freeTextMatch = line.match(new RegExp(`^\\s*(\\w+):\\s*text\\(['"](${pattern})['"]\\)`));
      if (freeTextMatch) {
        const [, fieldName, columnName] = freeTextMatch;
        
        // Check if next few lines have .references()
        const nextLines = lines.slice(i, i + 5).join('\n');
        const hasReference = nextLines.includes('.references(');
        
        if (!hasReference && columnName === pattern) {
          issues.push({
            type: pattern === 'type' || pattern === 'category' ? 'FREE_TEXT_TYPE' : 'FREE_TEXT_STATUS',
            table: 'unknown', // Would need more context
            column: fieldName,
            line: i + 1,
            severity: 'ERROR',
            message: `Column '${fieldName}' uses free text for '${pattern}' - should use FK or ENUM`,
            fix: `Change to FK: ${pattern}Id: text('${pattern}_id').references(() => ${pattern}es.id)`
          });
        }
      }
    }
    
    // Check for missing .references() on _id columns
    const idColumnMatch = line.match(/^(\w+):\s*text\(['"](\w+_id)['"]\)/);
    if (idColumnMatch) {
      const [, fieldName, columnName] = idColumnMatch;
      const tableName = columnName.replace('_id', '');
      
      // Skip if it's a primary key or already has reference
      if (fieldName !== 'id' && !line.includes('.references(')) {
        const nextLines = lines.slice(i, i + 3).join('\n');
        const hasReference = nextLines.includes('.references(');
        
        if (!hasReference && KNOWN_LOOKUP_TABLES.some(t => columnName.includes(t.replace('es', '')))) {
          issues.push({
            type: 'MISSING_FK',
            table: 'unknown',
            column: fieldName,
            line: i + 1,
            severity: 'WARNING',
            message: `Column '${fieldName}' looks like FK but missing .references()`,
            fix: `Add .references(() => ${tableName}.id)`
          });
        }
      }
    }
    
    // Check for missing cascade delete
    const refMatch = line.match(/\.references\(\(\)\s*=>\s*(\w+)\./);
    if (refMatch && !line.includes('onDelete')) {
      issues.push({
        type: 'MISSING_CASCADE',
        table: 'unknown',
        column: 'FK',
        line: i + 1,
        severity: 'WARNING',
        message: `Foreign key missing { onDelete: 'cascade' }`,
        fix: `Add { onDelete: 'cascade' } to .references()`
      });
    }
  }
  
  return issues;
}

function main() {
  console.log('🔍 Running Database Schema Audit...\n');
  
  const issues = auditSchema();
  
  if (issues.length === 0) {
    console.log('✅ No issues found!');
    return;
  }
  
  console.log(`⚠️  Found ${issues.length} issue(s):\n`);
  
  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARNING');
  
  if (errors.length > 0) {
    console.log('🚨 ERRORS (must fix):');
    for (const issue of errors) {
      console.log(`  Line ${issue.line}: ${issue.message}`);
      console.log(`    Fix: ${issue.fix}\n`);
    }
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (should fix):');
    for (const issue of warnings) {
      console.log(`  Line ${issue.line}: ${issue.message}`);
      console.log(`    Fix: ${issue.fix}\n`);
    }
  }
  
  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
