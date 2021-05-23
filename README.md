![GitHub Action](https://github.com/indiainvestments/slash_commands/actions/workflows/deno-lint-tests.yml/badge.svg)
[![](https://img.shields.io/github/license/indiainvestments/slash_commands)](https://github.com/indiainvestments/slash_commands/blob/main/LICENSE)

# Introduction

IndiaInvestments is a community to discuss investments, insurance, finance,
economy, and markets in India. This website is a collection of advice and
information we have organized as a community.

If you want to discuss anything on this website with other people, please check
out our sub-reddit and discord below.

[![](https://img.shields.io/reddit/subreddit-subscribers/indiainvestments?style=social)](https://reddit.com/r/indiainvestments)
[![](https://img.shields.io/discord/546638391127572500)](https://discord.gg/hqBNg4u)
[![All Contributors](https://img.shields.io/badge/all_contributors-20-orange.svg?style=flat-square)](https://github.com/indiainvestments/content#contributors-)

# Searching Wiki Bot

Slash commands for india investment Discord server to search the wiki.

# Setting Up & Running the Code

[Installation & Setting Up](https://github.com/indiainvestments/slash_commands/wiki/Installation-&-Setting-Up)

# Setting Up Git Hooks

Deno doesn't work well with `lint-staged`, so we've added a pre-commit hook
manually.

- After cloning the repo, run `cp scripts/pre-commit/sh .git/hooks/`. This would
  copy the `pre-commit.sh` file into your `.git/hooks/` directory.
- Change the file to be an executable, with `chmod +x .git/hooks/pre-commit.sh`
