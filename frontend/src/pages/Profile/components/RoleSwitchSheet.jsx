function RoleSwitchSheet({
  switchRole,
  switchingRole,
  currentRole,
  onCancel,
  onConfirm,
}) {
  if (!switchRole) {
    return null;
  }

  const currentRoleName =
    currentRole === 'customer'
      ? 'Customer'
      : currentRole === 'owner'
        ? 'Owner'
        : 'Delivery Partner';

  const targetRoleName =
    switchRole === 'customer'
      ? 'Customer'
      : switchRole === 'owner'
        ? 'Owner'
        : 'Delivery Partner';

  return (
    <div
      className="profile_switch_overlay"
      onClick={() => {
        if (!switchingRole) {
          onCancel();
        }
      }}
    >
      <section
        className="profile_switch_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile_switch_handle" />

        <div className="profile_switch_header">
          <h2>Switch Account?</h2>

          <p>
            You are currently logged in as {currentRoleName}. Do you want to
            switch to {targetRoleName}?
          </p>
        </div>

        <div className="profile_switch_actions">
          <button
            type="button"
            className="profile_switch_cancel"
            onClick={onCancel}
            disabled={switchingRole}
          >
            Cancel
          </button>

          <button
            type="button"
            className="profile_switch_confirm"
            onClick={onConfirm}
            disabled={switchingRole}
          >
            {switchingRole ? 'Switching...' : 'Switch'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default RoleSwitchSheet;
