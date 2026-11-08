# Pure presentation decisions shared by workspace consumers.
import Base
import ./TOKENS.bend as T

def feedback_tone(error: Bool) -> String:
  match error:
    case True{}: "error"
    case False{}: "info"

def feedback_delay(error: Bool, persistent: Bool) -> U32:
  match error persistent:
    case True{} _: 0
    case False{} True{}: 0
    case False{} False{}: T.feedback_duration_ms()

def panels_direction(narrow: Bool) -> String:
  match narrow:
    case True{}: "column"
    case False{}: "row"

def dismiss_sidebar(narrow: Bool, inside: Bool, toggle: Bool) -> Bool:
  narrow && Bool.not(inside) && Bool.not(toggle)
