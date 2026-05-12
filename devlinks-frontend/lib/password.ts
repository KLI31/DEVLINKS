export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function getPasswordCriteria(password: string): PasswordCriteria {
  return {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  const criteria = getPasswordCriteria(password);
  const passedChecks = Object.values(criteria).filter(Boolean).length;

  if (passedChecks <= 2) return "weak";
  if (passedChecks === 3) return "fair";
  if (passedChecks === 4) return "good";
  return "strong";
}

export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    weak: "Débil",
    fair: "Regular",
    good: "Buena",
    strong: "Fuerte",
  };
  return labels[strength];
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  const colors: Record<PasswordStrength, string> = {
    weak: "bg-destructive",
    fair: "bg-warning",
    good: "bg-primary",
    strong: "bg-success",
  };
  return colors[strength];
}