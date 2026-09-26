function PersonalDetailsField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  readOnly = false,
  helperText,
}) {
  return (
    <div className="personal_details_field">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />

      {helperText && <small>{helperText}</small>}
    </div>
  );
}

export default PersonalDetailsField;
