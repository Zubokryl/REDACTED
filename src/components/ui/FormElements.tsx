import React from 'react';
import styles from './FormElements.module.css';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className }) => {
  return (
    <div className={`${styles.formGroup} ${className || ''}`}>
      {children}
    </div>
  );
};

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, className, ...props }) => {
  return (
    <label className={`${styles.formLabel} ${className || ''}`} {...props}>
      {children}
    </label>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ className, error, ...props }) => {
  return (
    <>
      <input className={`${styles.formInput} ${className || ''}`} {...props} />
      {error && <div className={styles.error}>{error}</div>}
    </>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className, error, ...props }) => {
  return (
    <>
      <textarea className={`${styles.formTextarea} ${className || ''}`} {...props} />
      {error && <div className={styles.error}>{error}</div>}
    </>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ className, options, error, ...props }) => {
  return (
    <>
      <select className={`${styles.formSelect} ${className || ''}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className={styles.error}>{error}</div>}
    </>
  );
};

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  return (
    <div className={styles.formCheckbox}>
      <input type="checkbox" className={className} {...props} />
      <label htmlFor={props.id}>{label}</label>
    </div>
  );
};