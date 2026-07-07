# CloakRFQ Workflow Diagrams

## Purpose

Diagram the current ledger workflow at a technical level.

This document reflects the implemented Phase 1, Phase 2, and Phase 3 happy-path settlement scope. Failure recording and fallback promotion are intentionally not modeled here yet.

## Phase Boundary

```mermaid
flowchart LR
    P1["Phase 1<br/>Origination & Eligibility"]
    P2["Phase 2<br/>Private Quote Intake"]
    P3["Phase 3<br/>Quote Settlement"]
    End["Phase 3 success<br/>settlement evidence created"]

    P1 -->|"per-Funder RFQRequest exists"| P2
    P2 -->|"responseDeadline reached"| P3
    P3 -->|"CIP-56 settlement + pending Receivable transfer"| End
```

## Implemented Contract Flow

```mermaid
flowchart TD
    Seller["Seller"]
    Compliance["Compliance Party"]
    Risk["Risk Assessor"]
    Funder["Funder"]
    Token["External CIP-56 Token Workflow"]

    R["Receivable<br/>seller-owned represented receivable"]
    CA["ComplianceAttestation<br/>private detailed compliance output"]
    CC["ComplianceCertificate<br/>Compliance-signed package credential"]
    RA["RiskAttestation<br/>private detailed risk output"]
    RC["RiskCertificate<br/>Risk-signed package credential"]
    RFQ["RFQRequest<br/>per-Funder package and quote slot"]
    ALLOC["AllocationV2<br/>committed funding allocation"]
    SF["SettlementFactory<br/>CIP-56 batch settlement"]
    PQ["PrivateQuote<br/>Funder-signed allocation-backed quote"]
    RSS["ReceivableSaleSettlement<br/>Seller+Funder final evidence"]
    RT["Receivable<br/>pending transfer to Funder"]
    FR["Receivable<br/>Funder-owned after AcceptTransfer"]

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

    Funder -->|"obtain committed allocation outside CloakRFQ"| ALLOC
    Token --> ALLOC
    Funder -->|"exercise SubmitPrivateQuote"| RFQ
    ALLOC -. "fundingAllocationCid" .-> RFQ
    RFQ -->|"consumed"| PQ
    Token --> SF
    Seller -->|"exercise AcceptAndSettle"| PQ
    PQ -->|"SettlementFactory_SettleBatch"| SF
    SF -->|"settles allocation"| ALLOC
    PQ -->|"exercise Receivable.Transfer"| RT
    PQ -->|"create"| RSS
    RT -. "receivableTransferCid" .-> RSS
    Funder -->|"later exercise AcceptTransfer"| RT
    RT --> FR
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

    F->>T: Obtain committed AllocationV2 outside CloakRFQ
    F->>L: Exercise RFQRequest.SubmitPrivateQuote
    L->>L: Check quote terms
    L->>L: Fetch and validate AllocationV2
    L->>L: Consume RFQRequest
    L->>L: Create PrivateQuote
    L-->>S: PrivateQuote visible as observer
```

## Phase 3 Settlement Sequence

```mermaid
sequenceDiagram
    participant S as Seller
    participant L as Ledger
    participant T as CIP-56 Token Workflow
    participant F as Funder
    participant A as Auditor

    S->>L: Exercise PrivateQuote.AcceptAndSettle
    L->>L: Check responseDeadline passed and quote not expired
    L->>L: Fetch Receivable and validate Seller ownership + terms
    L->>L: Fetch AllocationV2 and SettlementFactory
    L->>T: Exercise SettlementFactory_SettleBatch with required funding allocation and optional extras
    T-->>L: AllocationResult_Settled
    L->>L: Exercise Receivable.Transfer to Funder
    L->>L: Create ReceivableSaleSettlement
    L-->>A: Settlement evidence visible as observer
    F->>L: Later exercise Receivable.AcceptTransfer
```

## RFQRequest Validation Surface

```mermaid
flowchart TD
    Submit["SubmitPrivateQuote"]

    QT["QuoteTerms<br/>- netPurchasePrice > 0<br/>- quoteExpiresAt > responseDeadline<br/>- now <= responseDeadline<br/>- now <= quoteExpiresAt"]
    A["AllocationV2<br/>- committed<br/>- deadline covers quote expiry<br/>- settlement id equals packageId<br/>- authorizer owner is Funder"]
    P["Payment leg<br/>- admin matches packageData.paymentInstrumentAdmin<br/>- instrument id matches packageData.paymentInstrumentId<br/>- sender-side leg pays Seller<br/>- amount equals netPurchasePrice"]
    Create["Create PrivateQuote<br/>Consume RFQRequest"]

    Submit --> QT
    Submit --> A
    Submit --> P
    QT --> Create
    A --> Create
    P --> Create
```

## AcceptAndSettle Validation Surface

```mermaid
flowchart TD
    Accept["AcceptAndSettle"]

    Time["Timing<br/>- now > responseDeadline<br/>- now <= quoteExpiresAt"]
    Rcv["Receivable<br/>- Seller still owns it<br/>- terms match packageData"]
    Alloc["AllocationV2<br/>- committed<br/>- deadline covers quote expiry<br/>- settlement id equals packageId<br/>- authorizer owner is Funder"]
    Factory["SettlementFactory<br/>- admin matches paymentInstrumentAdmin<br/>- settles required funding allocation<br/>- may include optional extra finalized allocations<br/>- SettlementFactory_SettleBatch returns settled results"]
    Transfer["Receivable.Transfer<br/>- creates pending transfer to Funder"]
    Evidence["ReceivableSaleSettlement<br/>- signed by Seller + Funder<br/>- auditor observes<br/>- links allocation, factory, pending transfer"]

    Accept --> Time
    Accept --> Rcv
    Accept --> Alloc
    Accept --> Factory
    Time --> Transfer
    Rcv --> Transfer
    Alloc --> Factory
    Factory --> Transfer
    Transfer --> Evidence
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

    CC -. "compare certifiedReceivableTerms" .-> PD
    RC -. "compare certifiedReceivableTerms" .-> PD
    RC -. "compare certifiedRiskTier" .-> PD

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
      RSS["ReceivableSaleSettlement"]
      RT["Pending Receivable transfer"]
      SF["SettlementFactory"]
      ALLOC["Funding Allocation"]
    end

    subgraph FunderVisible["Single Funder-visible"]
      RFQ_F["Own RFQRequest"]
      PQ_F["Own PrivateQuote"]
      RSS_F["ReceivableSaleSettlement"]
      RT_F["Pending Receivable transfer"]
      FR_F["Funder-owned Receivable after AcceptTransfer"]
    end

    subgraph AuditorVisible["Auditor-visible"]
      RSS_A["ReceivableSaleSettlement"]
    end

    subgraph Hidden["Hidden from Funders and third parties by default"]
      OtherRFQ["Other Funders' RFQRequests"]
      OtherPQ["Other Funders' PrivateQuotes"]
      RawBalances["Raw balances and unrelated holdings"]
      ComplianceDisclosure["Full ComplianceDisclosure"]
    end
```

## Current Happy-Path Lifecycle

This is the implemented happy-path lifecycle. There is no separate on-ledger close contract in Phase 2; the `responseDeadline` is enforced by `RFQRequest.SubmitPrivateQuote` and `PrivateQuote.AcceptAndSettle`.

```mermaid
stateDiagram-v2
    [*] --> ReceivableRegistered
    ReceivableRegistered --> Certified: ComplianceCertificate + RiskCertificate
    Certified --> RequestOpen: Seller creates per-Funder RFQRequest
    RequestOpen --> Quoted: Funder submits allocation-backed PrivateQuote
    RequestOpen --> IntakeClosed: responseDeadline reached without quote
    IntakeClosed --> [*]
    Quoted --> ReadyForSettlement: responseDeadline reached
    ReadyForSettlement --> Settled: Seller exercises AcceptAndSettle
    Settled --> PendingReceivableTransfer: Receivable.Transfer created
    PendingReceivableTransfer --> FunderOwnedReceivable: Funder exercises AcceptTransfer
    FunderOwnedReceivable --> [*]
```
