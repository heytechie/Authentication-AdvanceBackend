export const LOGIN_LOCKOUT_SCRIPT = `
  local accountFailures = redis.call("INCR", KEYS[1])
  local ipFailures = redis.call("INCR", KEYS[2])

  if accountFailures == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  if ipFailures == 1 then
    redis.call("EXPIRE", KEYS[2], ARGV[1])
  end

  return { accountFailures, ipFailures }
`;