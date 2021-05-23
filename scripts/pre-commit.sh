#!/usr/bin/env
#
# Taken from: https://gist.github.com/jkriss/7316b2265fd9db507d03db227fc830e5
#

# Redirect output to stderr.
exec 1>&2
# Returns list of files modififed
FILES=$(deno fmt)

if [ -n "$FILES" ]; then
  echo "formatted, adding files $FILES"
  echo "$FILES" | xargs git add
fi
exit 0
