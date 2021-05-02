import * as slash from "https://raw.githubusercontent.com/harmonyland/harmony/main/deploy.ts";
import { Embed } from "https://deno.land/x/harmony@v1.1.5/mod.ts";
import { chunk, randomHexColorGen } from "./utils.ts";
import { GitbookSpaceClient } from "./gitbook_client.ts";

const { env } = Deno;

slash.init({
  env: true,
});

const COMMANDS_SIZE = 2;
const GITBOOK_SPACE_ID = env.get("GITBOOK_SPACE_ID")!;
const GITBOOK_TOKEN = env.get("GITBOOK_TOKEN")!;
const GITBOOK_URL = env.get("GITBOOK_URL")!;
const GITBOOK_NAME = env.get("GITBOOK_NAME")!;

const randomHexColor = randomHexColorGen();

const client = new GitbookSpaceClient(GITBOOK_TOKEN, {
  spaceId: GITBOOK_SPACE_ID,
  gitbookUrl: GITBOOK_URL,
});

const commands = await slash.commands.all();

// Create Slash Commands
if (commands.size !== COMMANDS_SIZE) {
  slash.commands.bulkEdit([
    {
      name: "list",
      description: `List links from a page or group of ${GITBOOK_NAME} wiki.`,
      options: [{
        name: "query",
        description: "Query to search.",
        type: slash.SlashCommandOptionType.STRING,
        required: true,
      }],
    },
    {
      name: "search",
      description: `Search ${GITBOOK_NAME} wiki.`,
      options: [{
        name: "query",
        description: "Query to search.",
        type: slash.SlashCommandOptionType.STRING,
        required: true,
      }, {
        name: "limit",
        description: "Limit number of results. By default, it only shows 1.",
        type: slash.SlashCommandOptionType.INTEGER,
      }],
    },
  ]);
}

slash.handle("search", async (interaction) => {
  const [query, limit] = interaction.options;
  const results = await client.searchSpace(query.value);
  if (!results.length) {
    return interaction.reply({
      content: `Nothing found for your query: \`${query.value}\``,
      ephemeral: true,
    });
  }

  if (limit) {
    return interaction.reply(
      results.slice(0, limit.value).map((item) => item.url).join("\n"),
    );
  }
  return interaction.reply(results[0].url);
});

slash.handle("list", async (interaction) => {
  const [query] = interaction.options;
  try {
    const result = await client.list(query.value);
    const color = randomHexColor.next().value;
    const embeds: Embed[] = [];

    const header = new Embed()
      .setTitle(result.title)
      .setURL(result.url)
      .setColor(color);

    if (result.description) {
      header.setDescription(result.description);
    }

    embeds.push(header);

    const chunked = chunk(result.items, 5);

    for (const c of chunked) {
      const desc = c.map((item) => {
        return `**[${item.title}](${item.url})**\n${item.description ||
          "No description available."}`;
      }).join("\n\n");

      const em = new Embed()
        .setDescription(desc)
        .setColor(color);

      embeds.push(em);
    }

    return interaction.respond({
      embeds,
    });
  } catch (err) {
    interaction.reply({
      content: err.message,
      ephemeral: true,
    });
  }
});

slash.handle("*", (d) => d.reply("Unhandled Command", { ephemeral: true }));
slash.client.on("interactionError", console.error);
