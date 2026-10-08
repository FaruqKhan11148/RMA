import './RmaCharacter.css';

function RmaCharacter() {
  return (
    <div className="rma_character">
      <div className="rma_character_shadow" />

      <div className="rma_character_head">
        <div className="rma_character_cap">
          <span className="rma_character_cap_top" />
          <span className="rma_character_cap_brim" />
        </div>

        <div className="rma_character_face">
          <span className="rma_character_eye rma_character_eye_left" />
          <span className="rma_character_eye rma_character_eye_right" />

          <span className="rma_character_mouth" />
        </div>
      </div>

      <div className="rma_character_neck" />

      <div className="rma_character_body">
        <div className="rma_character_shirt_line" />

        <div className="rma_character_pocket">
          <span />
        </div>

        <div className="rma_character_arm rma_character_arm_left">
          <span className="rma_character_hand" />
        </div>

        <div className="rma_character_arm rma_character_arm_right">
          <span className="rma_character_hand" />
        </div>

        <div className="rma_character_phone">
          <span className="rma_character_phone_screen">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>

      <div className="rma_character_legs">
        <div className="rma_character_leg rma_character_leg_left">
          <span className="rma_character_shoe" />
        </div>

        <div className="rma_character_leg rma_character_leg_right">
          <span className="rma_character_shoe" />
        </div>
      </div>
    </div>
  );
}

export default RmaCharacter;
