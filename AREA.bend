# Bend-UI: when an area counts as narrow. Pure; ui.js only measures.
import Base

# An area is narrow below the breakpoint (px), the same line as the screen's.
def narrow(+width: F32, +breakpoint: F32) -> Bool:
  F32.is_gt(breakpoint, width)
