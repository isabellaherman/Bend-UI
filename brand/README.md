# Brand marks

Marks of other companies, used to show which AI is connected. They belong to their owners and follow their owners' brand guidelines; they are not covered by this repo's license.

| File | Mark | Owner |
|---|---|---|
| `claude.webp` | Claude | Anthropic |
| `openai.svg` | OpenAI | OpenAI |

Use them as the `mark` of an agent item:

```js
import claude from "bend-ui/brand/claude.webp";
{ id: "claude", mark: `<img src="${claude}" alt="">`, label: "Claude", ring: true }
```
