# ADR 0003: Preserve Real-World RFQ Functionality Before Optimizing Privacy

## Status

Accepted

## Date

2026-06-17

## Context

CloakRFQ Receipts is privacy-oriented, but it is still meant to represent a credible financial workflow. Some privacy strategies could hide more information by changing the RFQ into a different commercial process.

For example, replacing comparative quote selection with a threshold or first-acceptable quote model may make some privacy properties easier to achieve, but it changes the RFQ from a competitive best-deal process into a different acceptance process.

The guiding question is: "How private can this real financial function be made?" rather than "What financial function can be achieved with this level of privacy?"

## Decision

Preserve Real-World RFQ Functionality before optimizing privacy.

The RFQ should remain a competitive Receivable Sale process where Funders submit Private Quotes and quote selection aims to identify the best compliant commercial deal according to the Seller's criteria and applicable compliance rules.

Do not replace comparative quote selection with a threshold, first-acceptable quote, or other simplified process solely to gain privacy.

Privacy should be maximized around the real workflow. If a privacy goal cannot be achieved practically in the MVP without distorting the RFQ, treat it as a Privacy Ambition, Privacy Limitation, or stretch goal rather than changing the core functionality.

The quote-selection protocol remains undecided. This ADR decides the product priority, not the technical mechanism.

## Consequences

The product remains credible as a financial RFQ workflow rather than a privacy demo that only resembles finance.

Some information may need to be disclosed to an authorized party, mechanism, or later protocol in order to select the best compliant commercial deal. Any such disclosure should be minimized and explicitly scoped.

The MVP should clearly separate Privacy Guarantees from Privacy Ambitions and Privacy Limitations.

Unselected Funder Privacy remains valuable, but it should not override the requirement to preserve Real-World RFQ Functionality.

Technical design must answer how to evaluate or evidence the best compliant commercial deal with the least disclosure practical for the hackathon scope.
