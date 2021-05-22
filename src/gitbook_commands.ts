import * as slash from "https://raw.githubusercontent.com/indiainvestments/harmony/main/deploy.ts";
import { Embed } from "https://raw.githubusercontent.com/harmonyland/harmony/ce455c50c3af667a02077db5ffb79c5086510945/src/structures/embed.ts";
import { randomHexColorGen } from "./utils.ts";
import { GitbookSpaceClient } from "./gitbook_client.ts";
import { EmbedAuthor } from "https://raw.githubusercontent.com/indiainvestments/harmony/main/deploy.ts";
import { GitbookSearchNode } from "./types/index.d.ts";
import { Cache } from "./cache/page_desc_cache.ts";

const { env } = Deno;
slash.init({
  env: true,
});

const GITBOOK_SPACE_ID = env.get("GITBOOK_SPACE_ID") ?? '';
const GITBOOK_TOKEN = env.get("GITBOOK_TOKEN") ?? '';
const GITBOOK_API_URL = env.get("GITBOOK_API_URL") ?? '';

const randomHexColor = randomHexColorGen();

const client = new GitbookSpaceClient(GITBOOK_TOKEN, {
  spaceId: GITBOOK_SPACE_ID,
  gitbookApiUrl: GITBOOK_API_URL,
});

const cache = new Cache(client);
await cache.fillData();

slash.registerHandler("wiki", async (interaction) => {
  const [query] = interaction.options;
  try {
    let {results, timeTaken} = await client.searchSpace(query.value);
    if (!results.length) {
      return interaction.reply({
        content: `Nothing found for your query: \`${query.value}\``,
        ephemeral: true,
      });
    }
    const resultsSize = results.length;
    results = results.slice(0, 5);

    const embeds = [];
    const color = randomHexColor.next().value;

    let desc = results.map((content: GitbookSearchNode) => {
      const description = cache.getValue(content.uid);
      return `**[${content.title}](${client.iiGitbookBaseUrl}/${content.path})**\n${
        (description && description !== "") ? description : "No description available."
      }`
    }).join("\n\n");
    if (resultsSize > 5) {
      desc = `${desc}\n\n[click here more results from our wiki](${client.iiGitbookBaseUrl}/?q=${encodeURI(query.value)})`;
    }
    const embed = new Embed()
      .setColor(color)
      .setDescription(desc)
      .setThumbnail('https://i.imgur.com/kSxwaQA.png');
    embeds.push(embed);

    if (embeds.length <= 0) {
      return interaction.reply({
        content: `Nothing found for your query: \`${query.value}\``,
        ephemeral: true,
      });
    }
    const author: EmbedAuthor = {
      name: interaction.user.username,
      "icon_url": interaction.user.avatarURL()
    }
    embeds[0].setAuthor(author);
    embeds[embeds.length - 1].setFooter(`\/wiki query: ${query.value} | retrieved in ${(timeTaken).toString().padEnd(3, '0')} seconds`);
    return interaction.respond({
      embeds,
    });
  } catch (err) {
    console.error("Error in handling wiki command", err);
    return interaction.reply({
      content: `Something went wrong for your query: \`${query.value}\``,
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
