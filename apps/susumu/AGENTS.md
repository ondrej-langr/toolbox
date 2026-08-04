# susumu

This is a local first web application focused on opinionated and simple time tracking for freelancers. Before reading further make sure to read the root [AGENTS.md](../../AGENTS.md)

## Project Idea

This project focuses on simpler time tracking. The time tracking should be straightforward - select (or have preselected from last) current project, input what you are working on (autocomplete with today entries) and enter. This should creates entry at current time today.
Updating time for already created items should be possible within the same day as well as deleting the items. It is also possible to go back in time to see previous days and manage those items.

On top of that it is possible to see some summarization per project for today and this month. For current day it is also possible to see sum of all the same items (summed by time and sorted by duration)

The application has also possibility to define current projects for which the items are created.

All the data are stored locally with possibility to synchronize between machines through sharing user mnemonic by scanning qrcode to other device.

Read more about what is currently missing in the [TODO.md](./TODO.md)

## Technical background

This is a Vite application that uses radix-ui for styling and [evolu](https://www.evolu.dev/docs/api-reference) for data management as database. It uses React.js for UI and tailwind for little bit of styling where radix-ui is not enough. Source code is stored in [`src`](./src) folder

## Commands

- `pnpm build` - use when building the project
- `pnpm dev` - use when building and verifying applied changes. it opens localhost:3000
