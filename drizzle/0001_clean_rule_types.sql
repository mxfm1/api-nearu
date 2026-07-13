-- Pre-migration: Clean up rule_type data before altering enum
-- Maps old rule types to NULL or valid new values

-- 1. Set application_score_breakdown with invalid rule types to NULL
UPDATE application_score_breakdown SET rule_type = NULL WHERE rule_type NOT IN ('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');

-- 2. Set application_scoring_fields with invalid rule types to NULL
UPDATE application_scoring_fields SET rule_type = NULL WHERE rule_type NOT IN ('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');

-- 3. Set publication_scoring_rules with invalid rule types to NULL
UPDATE publication_scoring_rules SET rule_type = NULL WHERE rule_type NOT IN ('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');

-- 4. Optionally delete rules with invalid types
-- DELETE FROM publication_scoring_rules WHERE rule_type NOT IN ('VERIFIED_PROFILE', 'SAME_REGION', 'HAS_WEBSITE', 'ACCOUNT_AGE');
