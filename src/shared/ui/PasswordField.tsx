import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { LabeledField } from './LabeledField';
import { EyeToggle } from '../../features/auth/components/EyeToggle';

interface PasswordFieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
  helper?: string;
}

export function PasswordField({ label, error, helper, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <LabeledField
      label={label}
      error={error}
      helper={helper}
      secureTextEntry={!visible}
      trailingElement={
        <EyeToggle visible={visible} onToggle={() => setVisible((v) => !v)} />
      }
      {...inputProps}
    />
  );
}
