export function jellyExpandEasing(t) {
  return Math.min(1, Math.sin(28 * t - 6.16) / (5 * t - 1.1));
}

export function jellyCollapseEasing(t) {
      return  -1 * Math.min(1, Math.sin(28 * t - 6.16) / (5 * t - 1.1));
}

export function bounceEasing(t) {
  const MOVE_TIME = 0.46667;
  const FIRST_BOUNCE_TIME = 0.26666;

  if(t < MOVE_TIME) {
    return (4.592 * t * t);
  } else if(t < MOVE_TIME + FIRST_BOUNCE_TIME) {
    return (2.5 * t * t - 3 * t + 1.85556);
  } else {
    return (0.625 * t * t - 1.083 *t + 1.458);
  }
}
