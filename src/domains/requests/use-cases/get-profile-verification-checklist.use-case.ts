import type { IProfilesRepository } from '@/src/domains/profiles/repositories/profiles.repository.interface';
import type { IUsersRepository } from '@/src/domains/users/repositories/users.repository.interface';
import type { Profile } from '@/src/domains/profiles/entities/profile.entity';
import type { User } from '@/src/domains/users/entities/user.entity';

export type ProfileVerificationRequirementKey =
  | 'HAS_PROFILE'
  | 'HAS_NAME'
  | 'HAS_DESCRIPTION'
  | 'HAS_REGION'
  | 'HAS_CATEGORY'
  | 'HAS_LOGO'
  | 'HAS_WEBSITE'
  | 'HAS_WHATSAPP'
  | 'HAS_SOCIAL_LINK'
  | 'ACCOUNT_AGE';

export interface ProfileVerificationCheck {
  key: ProfileVerificationRequirementKey;
  label: string;
  description: string;
  required: boolean;
  passed: boolean;
  message: string;
}

export interface ProfileVerificationChecklist {
  eligible: boolean;
  checks: ProfileVerificationCheck[];
}

type Requirement = Omit<ProfileVerificationCheck, 'passed' | 'message'>;

const PROFILE_VERIFICATION_REQUIREMENTS: Requirement[] = [
  {
    key: 'HAS_PROFILE',
    label: 'Perfil creado',
    description: 'El usuario debe tener un perfil asociado.',
    required: true,
  },
  {
    key: 'HAS_NAME',
    label: 'Nombre del perfil',
    description: 'El perfil debe tener un nombre visible.',
    required: true,
  },
  {
    key: 'HAS_DESCRIPTION',
    label: 'Descripción del perfil',
    description: 'El perfil debe explicar claramente quién es y qué ofrece.',
    required: true,
  },
  {
    key: 'HAS_REGION',
    label: 'Región',
    description: 'El perfil debe indicar su región principal.',
    required: true,
  },
  {
    key: 'HAS_CATEGORY',
    label: 'Categoría',
    description: 'El perfil debe estar asociado a una categoría.',
    required: true,
  },
  {
    key: 'HAS_LOGO',
    label: 'Logo o imagen de perfil',
    description: 'El perfil debe tener una imagen identificatoria.',
    required: true,
  },
  {
    key: 'HAS_WEBSITE',
    label: 'Sitio web',
    description: 'Suma contexto y confianza, pero no bloquea la solicitud.',
    required: false,
  },
  {
    key: 'HAS_WHATSAPP',
    label: 'WhatsApp',
    description: 'Permite un canal de contacto directo.',
    required: false,
  },
  {
    key: 'HAS_SOCIAL_LINK',
    label: 'Red social',
    description: 'Ayuda a validar presencia pública del perfil.',
    required: false,
  },
  {
    key: 'ACCOUNT_AGE',
    label: 'Antigüedad de cuenta',
    description: 'Cuenta con más de 6 meses de antigüedad.',
    required: false,
  },
];

export type IGetProfileVerificationChecklistUseCase = ReturnType<typeof getProfileVerificationChecklistUseCase>;

export const getProfileVerificationChecklistUseCase =
  (profilesRepository: IProfilesRepository, usersRepository: IUsersRepository) =>
  async (userId: string): Promise<ProfileVerificationChecklist> => {
    const [profile, user] = await Promise.all([
      profilesRepository.findByUserId(userId),
      usersRepository.findById(userId),
    ]);

    return evaluateProfileVerificationChecklist(profile, user);
  };

export function evaluateProfileVerificationChecklist(
  profile: Profile | null,
  user: User | null,
): ProfileVerificationChecklist {
  const checks = PROFILE_VERIFICATION_REQUIREMENTS.map((requirement) => {
    const passed = evaluateRequirement(requirement.key, profile, user);
    return {
      ...requirement,
      passed,
      message: passed ? 'Cumplido' : getFailureMessage(requirement.key),
    };
  });

  return {
    eligible: checks.every((check) => !check.required || check.passed),
    checks,
  };
}

function evaluateRequirement(
  key: ProfileVerificationRequirementKey,
  profile: Profile | null,
  user: User | null,
): boolean {
  switch (key) {
    case 'HAS_PROFILE':
      return profile !== null;
    case 'HAS_NAME':
      return hasText(profile?.name);
    case 'HAS_DESCRIPTION':
      return hasText(profile?.description);
    case 'HAS_REGION':
      return hasText(profile?.regionId);
    case 'HAS_CATEGORY':
      return hasText(profile?.categoryId);
    case 'HAS_LOGO':
      return hasText(profile?.logoUrl);
    case 'HAS_WEBSITE':
      return hasText(profile?.website);
    case 'HAS_WHATSAPP':
      return hasText(profile?.whatsapp);
    case 'HAS_SOCIAL_LINK':
      return (profile?.socialLinks?.length ?? 0) > 0;
    case 'ACCOUNT_AGE':
      return isOlderThanSixMonths(user?.createdAt);
  }
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOlderThanSixMonths(value: Date | string | null | undefined): boolean {
  if (!value) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(value) < sixMonthsAgo;
}

function getFailureMessage(key: ProfileVerificationRequirementKey): string {
  switch (key) {
    case 'HAS_PROFILE':
      return 'Creá tu perfil antes de solicitar verificación.';
    case 'HAS_NAME':
      return 'Completá el nombre del perfil.';
    case 'HAS_DESCRIPTION':
      return 'Agregá una descripción clara del perfil.';
    case 'HAS_REGION':
      return 'Seleccioná una región.';
    case 'HAS_CATEGORY':
      return 'Seleccioná una categoría.';
    case 'HAS_LOGO':
      return 'Subí un logo o imagen de perfil.';
    case 'HAS_WEBSITE':
      return 'Podés agregar un sitio web para reforzar tu solicitud.';
    case 'HAS_WHATSAPP':
      return 'Podés agregar WhatsApp como canal de contacto.';
    case 'HAS_SOCIAL_LINK':
      return 'Podés agregar una red social para validar presencia pública.';
    case 'ACCOUNT_AGE':
      return 'La cuenta todavía no tiene más de 6 meses.';
  }
}
