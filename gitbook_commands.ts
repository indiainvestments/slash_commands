import * as slash from "https://raw.githubusercontent.com/dwight-schrute/harmony/slashTest/deploy.ts";
import { Embed } from "https://raw.githubusercontent.com/harmonyland/harmony/ce455c50c3af667a02077db5ffb79c5086510945/src/structures/embed.ts";
import { chunk, fetchAndSave, randomHexColorGen } from "./utils.ts";
import { GitbookSpaceClient } from "./gitbook_client.ts";
import { EmbedAuthor } from "https://raw.githubusercontent.com/indiainvestments/harmony/main/deploy.ts";
import { GitbookSearchNode } from "./types/index.d.ts";
import { Cache } from "./cache/page_desc_cache.ts";

const { env } = Deno;
slash.init({
  env: true,
});

const COMMANDS_SIZE = 2;
const GITBOOK_SPACE_ID = env.get("GITBOOK_SPACE_ID")!;
const GITBOOK_TOKEN = env.get("GITBOOK_TOKEN")!;
const GITBOOK_API_URL = env.get("GITBOOK_API_URL")!;
const GITBOOK_NAME = env.get("GITBOOK_NAME")!;

const randomHexColor = randomHexColorGen();

const client = new GitbookSpaceClient(GITBOOK_TOKEN, {
  spaceId: GITBOOK_SPACE_ID,
  gitbookApiUrl: GITBOOK_API_URL,
});

const cache = new Cache(client);
await cache.fillData();
const commands = await slash.commands.all();
// Create Slash Commands
if (commands.size !== COMMANDS_SIZE) {
  slash.commands.bulkEdit([
    {
      name: "list",
      description: `List links from a page or group of ${GITBOOK_NAME} wiki.`,
      options: [
        {
          name: "query",
          description: "Query to search.",
          type: slash.SlashCommandOptionType.STRING,
          required: true,
        },
      ],
    },
    {
      name: "weighted",
      description: `Search ${GITBOOK_NAME} wiki.`,
      options: [
        {
          name: "query",
          description: "Query to search.",
          type: slash.SlashCommandOptionType.STRING,
          required: true,
        },
        {
          name: "limit",
          description: "Limit number of results. By default, it only shows 1.",
          type: slash.SlashCommandOptionType.INTEGER,
        },
      ],
    },
  ]);
}

slash.registerHandler("weighted", async (interaction) => {
  const [query, limit = {value: 1}] = interaction.options;
  try {
    console.log("weighted command");
    let {results, timeTaken} = await client.searchSpace(query.value);
    if (!results.length) {
      return interaction.reply({
        content: `Nothing found for your query: \`${query.value}\``,
        ephemeral: true,
      });
    }
    results = results.slice(0, limit.value);

    const embeds = [];
    const color = randomHexColor.next().value;
    const contentChunks = chunk(results, 5);

    for (const contentChunk of contentChunks) {
      const desc = contentChunk.map((content: GitbookSearchNode) => {
        const description = cache.getValue(content.uid);
        return `**[${content.title}](${client.iiGitbookBaseUrl}/${content.path})**\n${
          description ?? "No description available."
        }`
      }).join("\n\n");
      const embed = new Embed().setColor(color);
      embed.setDescription(desc);
      embeds.push(embed);
    }

    if (embeds.length <= 0) {
      return interaction.reply({
        content: `Nothing found for your query: \`${query.value}\``,
        ephemeral: true,
      });
    }
    const author: EmbedAuthor = {
      name: interaction.user.username,
      icon_url: interaction.user.avatarURL()
    }
    embeds[0].setAuthor(author);
    embeds[embeds.length - 1].setFooter(`\/weighted query: ${query.value} limit: ${limit.value} | retrieved in ${(timeTaken).toString().padEnd(3, '0')} seconds`);
    return interaction.respond({
      embeds,
    });
  } catch (err) {
    console.log("error in weighted", err);
    return interaction.reply({
      content: `Something went wrong for your query: \`${query.value}\``,
      ephemeral: true,
    });
  }
});

slash.registerHandler("list", async (interaction) => {
  const [query] = interaction.options;
  try {
    const {page: result, timeTaken} = await client.list(query.value);
    const color = randomHexColor.next().value;
    const embeds: Embed[] = [];

    const author: EmbedAuthor = {
      name: interaction.user.username,
      icon_url: interaction.user.avatarURL()
    }
    const header = new Embed()
      .setTitle(result.title)
      .setURL(result.url)
      .setColor(color)
      .setAuthor(author);

    if (result.description && result.description !== "") {
      header.setDescription(result.description);
    }

    embeds.push(header);

    const limitedList = result.items.slice(0, 5);

    let desc = limitedList
      .map((item) => {
        return `**[${item.title}](${item.url})**\n${
          item.description || "No description available."
        }`;
      })
      .join("\n\n");
    if (limitedList.length >= 5) {
      desc = `${desc}\n\n[click here more results](${client.iiGitbookBaseUrl}/?q=${encodeURI(query.value)})`;
    }

    if (desc && desc !== "") {
      const em = new Embed().setDescription(desc).setColor(color);
      embeds.push(em);
    }
    
    embeds[embeds.length - 1].setFooter(`\/list query: ${query.value} | retrieved in ${(timeTaken).toString().padEnd(3, '0')} seconds`)
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

slash.registerHandler("*", (d) =>
  d.reply({
    content: `Unhandled command`,
    ephemeral: true,
  })
);
slash.client.on("interactionError", console.error);
