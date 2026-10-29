# WebCraft Website Builder

Customers pick a budget, design the structure and look of their website, choose features, watch a live preview and submit a project brief for a quotation.

## Routes

| Route | What it is |
| --- | --- |
| `/build` | Intro screen, then the 12-step builder. The store step only appears for e-commerce projects. |
| `/custom-estimate` | Custom estimate form for projects over GH₵10,000 or with unusual requirements. Works at any budget. |
| `/build/submitted` | Confirmation page with the reference number, next steps, brief download and an "email me a copy" link. |
| `/track?ref=WB-XXXXXXXX` | Status page for customers. They can reply to questions and accept or decline a quotation. |
| `/admin` → **Website Builder** tab | Lists all briefs. Filter by status, budget tier, website type and kind. Includes a quote editor with an audit trail, clarification requests, customer replies, asset previews and TXT/JSON/CSV export. |
| `/admin/pricing` | Price list editor. Prices are saved to Firestore (`siteConfig/priceList`) and every save is recorded in `priceListHistory`. |

## Where things live

- `src/data/builder/defaultPriceList.js`: the default price list (GH₵). **The prices are placeholders. Review them before launch.**
- `src/data/builder/builderOptions.js`: types, pages, themes, fonts, features, statuses and budget tiers.
- `src/utils/builderPricing.js`: the pricing engine. It handles dependencies, bundles (so shared work isn't counted twice), manual-review flags, budget comparison, lower-cost alternatives and recurring costs. Recurring costs are always kept separate from the build estimate.
- `src/utils/builderBrief.js`: sanitizes the project spec and builds the plain-text brief.
- `src/services/builderService.js`: handles submission, uploads, status lookup and customer replies.
- `src/services/adminBuilderService.js`: handles admin updates (quotes, audit trail, clarifications).

## Data model

- `websiteBuilderRequests/{WB-… | CE-…}`: the full brief. Only the admin can read it. The admin can change only `status`, `adminNotes`, `quote`, `quoteHistory`, `clarifications` and `updatedAt`.
- `builderRequestStatus/{ref}`: a status document with no personal data. Anyone with the reference number can fetch it, but the collection cannot be listed.
- `builderCustomerReplies/*`: messages and quote acceptances from customers. Only the admin can read them.
- `siteConfig/priceList`: readable by everyone and writable only by the admin.

## Before launch

1. **Set real prices** at `/admin/pricing`, then click Save once so the price list is stored in Firestore.
2. **Deploy the rules** with `npm run deploy:rules`, which deploys both `firestore.rules` and `storage.rules`. The builder will not work in production until the new rules are live.
3. Run `npm run test:builder` and `npm run test:security`.
4. Test with a few real users on real phones before announcing the builder.

## Known limits

- Confirmation and quotation messages are sent through prefilled email and WhatsApp links. There is no automatic email because the project has no backend for sending it. To add one, install the Firebase "Trigger Email" extension or add a Cloud Function triggered on `websiteBuilderRequests`.
- Drafts are saved in the browser on the customer's device. Uploaded files are not saved with the draft, so a customer who leaves before submitting has to attach them again.
- The text helper uses templates and runs in the browser. No data is sent to an AI service.
