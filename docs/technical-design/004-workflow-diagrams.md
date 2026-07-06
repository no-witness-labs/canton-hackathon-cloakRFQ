# CloakRFQ Workflow Diagrams

## Purpose

Diagram the current ledger workflow at a technical level.

This document reflects the implemented Phase 1 and Phase 2 scope. Phase 3 is shown only as a boundary because quote review, selection, fallback, and settlement are not implemented yet.

## Phase Boundary

```mermaid
flowchart LR
    P1["Phase 1<br/>Origination & Eligibility"]
    P2["Phase 2<br/>Private Quote Intake"]
    P3["Phase 3<br/>Review, Selection & Settlement<br/>(not implemented)"]

    P1 -->|"per-Funder RFQRequest exists"| P2
    P2 -->|"RFQ responseDeadline reached"| P3
```

## Implemented Contract Flow

```mermaid
flowchart TD
    Seller["Seller"]
    Compliance["Compliance Party"]
    Risk["Risk Assessor"]
    Funder["Funder"]
    Token["CIP-56 Token Allocation"]

    R["Receivable<br/>seller-owned represented receivable"]
    CA["ComplianceAttestation<br/>private detailed compliance output"]
    CC["ComplianceCertificate<br/>Compliance-signed package credential"]
    RA["RiskAttestation<br/>private detailed risk output"]
    RC["RiskCertificate<br/>Risk-signed package credential"]
    RFQ["RFQRequest<br/>per-Funder package and quote slot"]
    ALLOC["AllocationV2<br/>committed funding allocation"]
    PQ["PrivateQuote<br/>Funder-signed allocation-backed quote"]

    Seller -->|"create"| R
    Compliance -->|"create"| CA
    Seller -->|"exercise CreateComplianceCertificate"| CA
    CA --> CC
    Risk -->|"create"| RA
    Seller -->|"exercise CreateRiskCertificate"| RA
    RA --> RC
    Seller -->|"create one per Funder"| RFQ

    R -. "receivableCid" .-> RFQ
    CC -. "certificate cid" .-> RFQ
    RC -. "certificate cid" .-> RFQ

    Funder -->|"obtain committed allocation"| ALLOC
    Token --> ALLOC
    Funder -->|"exercise SubmitPrivateQuote"| RFQ
    ALLOC -. "fundingAllocationCid" .-> RFQ
    RFQ -->|"consumed"| PQ
```

## Phase 1 Sequence

```mermaid
sequenceDiagram
    participant S as Seller
    participant C as Compliance Party
    participant R as Risk Assessor
    participant L as Ledger
    participant F as Funder

    S->>L: Create Receivable
    C->>L: Create ComplianceAttestation
    S->>L: Exercise CreateComplianceCertificate
    L-->>S: ComplianceCertificate
    R->>L: Create RiskAttestation
    S->>L: Exercise CreateRiskCertificate
    L-->>S: RiskCertificate
    S->>L: Create RFQRequest for Funder
    L-->>F: RFQRequest visible as observer
```

## Phase 2 Sequence

```mermaid
sequenceDiagram
    participant F as Funder
    participant T as CIP-56 Token Workflow
    participant L as Ledger
    participant S as Seller

    F->>T: Obtain committed AllocationV2 for RFQ context
    F->>L: Exercise RFQRequest.SubmitPrivateQuote
    L->>L: Check quote terms
    L->>L: Fetch and validate AllocationV2
    L->>L: Consume RFQRequest
    L->>L: Create PrivateQuote
    L-->>S: PrivateQuote visible as observer
```

## RFQRequest Validation Surface

```mermaid
flowchart TD
    Submit["SubmitPrivateQuote"]

    QT["QuoteTerms<br/>- netPurchasePrice > 0<br/>- quoteExpiresAt > responseDeadline<br/>- now <= responseDeadline<br/>- now <= quoteExpiresAt"]
    A["AllocationV2<br/>- committed<br/>- deadline covers quote expiry<br/>- settlement cid references RFQRequest<br/>- authorizer owner is Funder"]
    P["Payment leg<br/>- admin matches packageData.paymentInstrumentAdmin<br/>- instrument id matches packageData.paymentInstrumentId<br/>- sender-side leg pays Seller<br/>- amount covers netPurchasePrice"]
    Create["Create PrivateQuote<br/>Consume RFQRequest"]

    Submit --> QT
    Submit --> A
    Submit --> P
    QT --> Create
    A --> Create
    P --> Create
```

## Authenticity Links

```mermaid
flowchart LR
    RFQ["RFQRequest"]
    R["Receivable"]
    CC["ComplianceCertificate"]
    RC["RiskCertificate"]
    PD["RFQPackageData"]

    RFQ -->|"receivableCid"| R
    RFQ -->|"complianceCertificateCid"| CC
    RFQ -->|"riskCertificateCid"| RC
    RFQ -->|"packageData"| PD

    CC -->|"certifiedReceivableTerms"| PD
    RC -->|"certifiedReceivableTerms"| PD
    RC -->|"certifiedRiskTier"| PD

    note1["Verifier compares request fields against authority-signed certificates.<br/>The Seller-authored request is not itself an authority proof."]
    RFQ -.-> note1
```

## Visibility Summary

```mermaid
flowchart TD
    subgraph SellerVisible["Seller-visible"]
      R["Receivable"]
      CA["ComplianceAttestation"]
      CC["ComplianceCertificate"]
      RA["RiskAttestation"]
      RC["RiskCertificate"]
      RFQ_S["RFQRequest"]
      PQ["PrivateQuote"]
    end

    subgraph FunderVisible["Single Funder-visible"]
      RFQ_F["Own RFQRequest"]
      PQ_F["Own PrivateQuote"]
    end

    subgraph Hidden["Hidden by default"]
      OtherRFQ["Other Funders' RFQRequests"]
      OtherPQ["Other Funders' PrivateQuotes"]
      RawBalances["Raw balances and unrelated holdings"]
      ComplianceDisclosure["Full ComplianceDisclosure"]
    end
```

## Current State Machine

```mermaid
stateDiagram-v2
    [*] --> ReceivableRegistered
    ReceivableRegistered --> Certified: ComplianceCertificate + RiskCertificate
    Certified --> RequestOpen: Seller creates per-Funder RFQRequest
    RequestOpen --> Quoted: Funder submits allocation-backed PrivateQuote
    RequestOpen --> IntakeClosed: responseDeadline reached without quote
    Quoted --> Phase3Boundary: responseDeadline reached
    IntakeClosed --> Phase3Boundary
    Phase3Boundary --> [*]
```

## Phase 3 Boundary

```mermaid
flowchart LR
    PQ["PrivateQuote(s)<br/>created before responseDeadline"]
    Deadline["responseDeadline reached"]
    P3["Phase 3 design<br/>review, selection, fallback, settlement"]

    PQ --> Deadline --> P3
```
