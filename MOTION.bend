# Bend-UI: the agent's motion. Pure math; agent.js only draws what comes back.
#
# The face is a sphere. An eye is a point on it at (lon, lat), in radians. The
# sphere turns by yaw (left/right) and pitch (up/down); we see it from the
# front, so a point shows at (x, y) and is visible while z > 0.

import Base

# Where the eyes sit on the sphere.
def eye_lon() -> F32: 0.36
def eye_lat() -> F32: 0.16

# A point (lon, lat) after the sphere turns by yaw: its x, and its depth before pitch.
def turn_x(+lon: F32, +lat: F32, +yaw: F32) -> F32:
  (F32.cos(lat) * F32.sin(lon) * F32.cos(yaw) + F32.cos(lat) * F32.cos(lon) * F32.sin(yaw) : F32)

def turn_z(+lon: F32, +lat: F32, +yaw: F32) -> F32:
  (F32.cos(lat) * F32.cos(lon) * F32.cos(yaw) - F32.cos(lat) * F32.sin(lon) * F32.sin(yaw) : F32)

# The same point after pitch: its y (up is positive) and its depth (visible while > 0).
def face_x(+lon: F32, +lat: F32, +yaw: F32) -> F32:
  turn_x(lon, lat, yaw)

def face_y(+lon: F32, +lat: F32, +yaw: F32, +pitch: F32) -> F32:
  (F32.sin(lat) * F32.cos(pitch) - turn_z(lon, lat, yaw) * F32.sin(pitch) : F32)

def face_z(+lon: F32, +lat: F32, +yaw: F32, +pitch: F32) -> F32:
  (F32.sin(lat) * F32.sin(pitch) + turn_z(lon, lat, yaw) * F32.cos(pitch) : F32)

# How much a mark on the sphere shrinks along an axis near the edge: sqrt(1 - p²).
def squash(+p: F32) -> F32:
  F32.sqrt(F32.max(0.0, (1.0 - p * p : F32)))

# How far the face turns toward a point: (dx, dy) from its center, reach in pixels.
# Turns at most 0.7 (yaw) and 0.55 (pitch) radians, so the eyes never reach the edge.
def look_yaw(+dx: F32, +dy: F32, +reach: F32) -> F32:
  (dx / F32.max(F32.hypot(dx, dy), 1.0) * F32.min(1.0, (F32.hypot(dx, dy) / reach : F32)) * 0.7 : F32)

def look_pitch(+dx: F32, +dy: F32, +reach: F32) -> F32:
  (dy / F32.max(F32.hypot(dx, dy), 1.0) * F32.min(1.0, (F32.hypot(dx, dy) / reach : F32)) * 0.55 : F32)

# A damped spring: the next velocity toward a target, over dt seconds.
# Stiffness 140 and damping 18 settle with a small bounce.
def spring(+vel: F32, +pos: F32, +target: F32, +dt: F32) -> F32:
  (vel + (140.0 * (target - pos) - 18.0 * vel) * dt : F32)

# Ease out: fast, then slow. t goes 0 → 1.
def ease_out(+t: F32) -> F32:
  (1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t) : F32)

# The items around the face. Fan (lg): one every 45°, starting to the left (180°)
# and turning up; distance in face radii. Row (sm): a line to the left.
def fan_angle(+i: F32) -> F32:
  (3.14159265 * (180.0 + 45.0 * i) / 180.0 : F32)

def fan_dist() -> F32: 2.0

def fan_x(+i: F32, +r: F32, +t: F32) -> F32:
  (F32.cos(fan_angle(i)) * r * fan_dist() * t : F32)

def fan_y(+i: F32, +r: F32, +t: F32) -> F32:
  (F32.sin(fan_angle(i)) * r * fan_dist() * t : F32)

# Row: the item's center, left of the face. r = face radius, w = item width, gap in pixels.
def row_x(+i: F32, +r: F32, +w: F32, +gap: F32, +t: F32) -> F32:
  ((0.0 - (r + gap + w / 2.0 + i * (w + gap))) * t : F32)

# Hover (open: "hover"): how long the options stay after the pointer leaves, in seconds.
# Long enough to cross the gap between the face and an option.
def hover_close() -> F32: 0.28
