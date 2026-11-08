# Bend-UI: which way a menu opens. Pure; ui.js only measures and places.
import Base

# A menu opens below its button unless it doesn't fit there and there is more room above (px).
def opens_up(+below: F32, +above: F32, +height: F32) -> Bool:
  F32.is_gt(height, below) && F32.is_gt(above, below)
