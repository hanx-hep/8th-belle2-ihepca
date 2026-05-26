---
colorSchema: light
color: orange-light
layout: cover
theme: neversink
routerMode: hash
lineNumbers: true
neversink_string: "8th Workshop of Belle II China Group"
# title of your slide, will inferred from the first header if not specified
title: The Upgrade of IHEP Grid Certification Authority
# titleTemplate for the webpage, `%s` will be replaced by the slides deck's title
titleTemplate: '%s - Xiao Han'
# favicon, can be a local file path or URL
favicon: /openxpki-favicon.png
# global page transition
transition: fade
---

### The Upgrade of IHEP Grid Certification Authority

#### <mdi-certificate /> OpenXPKI · Certificate Lifecycle Automation


**Xiao Han · on behalf of IHEP Computing Center** 
<a href="mailto:hanx@ihep.ac.cn"></a><Email v="hanx@ihep.ac.cn" />

May 31st 2026, Dalian, 
<a href="https://indico.ihep.ac.cn/event/28920" class="ns-c-iconlink"><mdi-open-in-new />8th Workshop of Belle II China Group</a>, 
<a href="https://github.com/hanx-hep/27th-junocm-dci" class="ns-c-iconlink"><mdi-open-in-new />GitHub Repository</a>


---
layout: side-title
title: Table of Contents
color: rose-light
align: cm-lm
---

:: title ::

# Outline

:: content ::

- **Background & Pain Points** — Old System Issues
- **From OpenCA to OpenXPKI**
    - **New System Overview** — OpenXPKI Architecture
- **System Architecture** — Components & Flow
    - **Old vs New Comparison** — Key Changes at a Glance
    - **User Entry Points** — WebUI / API / Download
    - **Certificate Workflow** — Request → Approve → Issue
    - **CRL & Publishing** — Revocation & Relying Parties
- **Migration Plan** — Next Steps

---
layout: section
color: cyan-light
---

# Background & Pain Points

---
layout: top-title
color: gray-light
---
:: title ::
# Background & Pain Points — Problems with the Old System

:: content ::
<mdi-alert-circle /> The current **P**ublic **K**ey **I**nfrastructure(PKI) system [cagrid.ihep.ac.cn](https://cagrid.ihep.ac.cn) is **outdated**.

**Key Issues of the Old System：**

| Pain Point | Impact |
|---|---|
| Root CA: 1024-bit | Insecure for production use |
| Framework: OpenCA | Outdated, community abandoned for years |
| Manual Offline Issuance | Admin must physically enter an isolated room to operate CA server |
| Manual CRL Publishing | Manual generation/push after revocation — severe delays |

<br>

<mdi-arrow-right-circle /> A  **automated, auditable, user-friendly**  PKI system is needed.

---
layout: section
color: red-light
---

# From <span style="color:#888;font-size:0.7em;vertical-align:middle;">🔐 OpenCA</span> → <img src="/openxpki-logo.png" style="height:1.2em;vertical-align:middle;margin:0 4px;" /> OpenXPKI

---
layout: top-title
color: gray-light
---

:: title ::
# New System Overview — OpenXPKI

:: content ::
<mdi-server-network /> **OpenXPKI** is an enterprise-grade PKI/Trustcenter software for X.509v3 certificate lifecycle management.
Established 2009, open-source (Apache 2.0), maintained by White Rabbit Security GmbH.

**Key Characteristics：**

- Workflow-driven certificate lifecycle — request, approval, issuance, revocation
- Multi-protocol enrollment: EST · SCEP · ACME · SimpleCMC · REST API
- Flexible crypto layer — HSM support via PKCS#11, OpenSSL backend
- Multi-tenant PKI Realms with seamless CA rollover
- YAML-based configuration — auditable, version-controlled, Git-friendly
- Multiple auth methods: LDAP · SAML · OAuth · Client Cert

<mdi-information /> We deploy the `ihepca` realm within OpenXPKI to serve IHEP Grid CA operations。

---
layout: section
color: purple-light
---

# System Architecture

---
layout: top-title
color: gray-light
---

:: title ::
# System Architecture

:: content ::
<mdi-graph /> Understanding OpenXPKI Architecture from the User Perspective。

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.6}
graph LR
    User[User] -->|HTTPS| WebUI[WebUI :8443]
    User -->|EST/SCEP| API[Automation Interface]
    WebUI --> Client[OpenXPKI Client]
    API --> Client
    Client --> Server[OpenXPKI Server]
    Server --> DB[(MariaDB)]
    Server --> LDAP[LDAP Auth]
    Server --> Mail[Email Notification]
    Server --> Download[/download/]
    Download --> RP[Relying Party]
```
</div>

**Component Layers:** User → Access → Business Logic → Data → Publishing


---
layout: top-title
color: gray-light
---

:: title ::
# Old vs New Comparison

:: content ::
There are **five key dimensions** to compare between the old system and the new one:
| Dimension | The old system (OpenCA) | New System (OpenXPKI) |
|---|---|---|
| Platform URL | cagrid.ihep.ac.cn | gridca.ihep.ac.cn |
| User Entry Points | Basic WebUI | Modern WebUI + CLI + API |
| Issuance Method | Manual offline | Workflow-driven with RA review |
| Approval Mechanism | Offline (email) | Online RA workflow approval |
| Automation Interface | None |EST / SCEP / RPC API |

The RA mechanism is similar in both systems, but the old system used **Offline Approval**, while the new one uses **Online Workflow Approval**。

---
layout: top-title
color: gray-light
---

:: title ::
# User Entry Points

:: content ::
<mdi-web /> Three main entry points for users：

**WebUI (Primary Entry)：**
- [https://gridca.ihep.ac.cn/webui/ihepca/](https://gridca.ihep.ac.cn/webui/ihepca/)

**Public Download Paths：**
- CA Certificate：`/download/<CA_Name>.crt`
- CRL：`/download/<CA_Name>.crl`

**Automation Interface：**
- EST：`/.well-known/est/...`
- SCEP：`/scep/...`
- RPC/API：OpenXPKI Client → Backend Workflow

<mdi-information /> Regular users should primarily use WebUI，Automation Interfaces target bulk integration。

---
layout: top-title
color: gray-light
---

:: title ::
# Login & Roles

:: content ::
<mdi-shield-account /> `ihepca` realm supports multiple auth methods; LDAP + client certs recommended for production。

**User Roles：**

| Role | Permissions |
|---|---|
| **User** | Submit requests, view own certificates and workflows |
| **RA Operator** | Approve requests, revoke certificates, issue CRLs, publish CA/CRL |
| **Anonymous** | Browse public information only |

**Authentication Methods：**
- <mdi-check /> LDAP(IHEP SSO) Username/Password
- <mdi-check /> Client Certificate Login

---
layout: section
color: green-light
---

# Certificate Workflow

---
layout: top-title
color: gray-light
---

:: title ::
# User Certificate Request Flow

:: content ::
<mdi-account-key /> Regular users request via  `User Certificate`  profile。

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.65}
sequenceDiagram
    User->>WebUI: Select User Certificate
    WebUI->>OpenXPKI: Submit CSR / SPKAC
    OpenXPKI->>RA: Enter approval queue
    RA->>OpenXPKI: Approve
    OpenXPKI->>OpenXPKI: Issue Certificate (RSA 4096)
    OpenXPKI-->>User: Notify for Download
    User->>WebUI: Download Cert + PKCS#12
```
</div>

**Certificate Features：** Server-side key generation · RSA 4096 · clientAuth + emailProtection

**Export Formats：** PKCS#12 · PKCS#8 PEM/DER · Java Keystore · OpenSSL Private Key

---
layout: top-title
color: gray-light
---

:: title ::
# Host Certificate Request Flow

:: content ::
<mdi-server />  via  `Host Certificate`  profile。

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.65}
sequenceDiagram
    Admin->>WebUI: Select Host Certificate
    Admin->>WebUI: Enter FQDN + DNS SAN
    WebUI->>OpenXPKI: Submit Host Certificate Request
    OpenXPKI->>RA: Enter approval queue
    RA->>OpenXPKI: Approve
    OpenXPKI->>OpenXPKI: Issue Host Certificate
    OpenXPKI-->>Admin: Notify for Download
    Admin->>WebUI: Download cert + deploy to server
```
</div>

**Differences from User Certificates：** Subject is FQDN · serverAuth Purpose

---
layout: top-title
color: gray-light
---

:: title ::
# Certificate Lifecycle Management

:: content ::
<mdi-lifebuoy /> Full lifecycle tracking from request to revocation in WebUI。

**Workflow States：**

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.55}
graph LR
    A[Submitted] --> B[Pending Approval]
    B --> C{RA Approval}
    C -->| via | D[Issued]
    C -->|Reject| E[Rejected]
    D --> F{Revocation Request}
    F --> G[Revoked]
```
</div>

**Regular users can do in WebUI：**
- Submit new requests · View status · Download certs & keys
- Initiate revocation · View CRL info · Search certs

**RA Operator Additional Permissions：**
- Approve/Reject · Batch revoke · CRL issuance · CA/CRL publish

---
layout: top-title
color: gray-light
---

:: title ::
# CRL & Publishing

:: content ::
<mdi-file-document-alert /> After revocation takes effect, relying parties need the latest CRL to detect it。

**CRL Policy：**
- Validity: 14 days
- Renewal window: 3 days before expiry

**Publishing Flow：**

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.45}
graph LR
    A[Certificate Revoked] --> B[crl_issuance]
    B --> C[Generate New CRL]
    C --> D[ca_publish]
    D --> E[Copy to download directory]
    E --> F[Relying Parties Download & Verify]
```
</div>



---
layout: top-title
color: gray-light
---

:: title ::
# Auto Notifications & Expiry Alerts

:: content ::
<mdi-bell-ring /> The system has email notifications covering the full lifecycle。

**Notification Scenarios：**

| Event | Recipient |
|---|---|
| New CSR Pending Approval | RA Operator |
| Approve | Applicant |
| Certificate Issued Successfully | Applicant |
| CSR Rejected | Applicant |
| Revocation Pending Approval | RA Operator |
| Certificate Expiring Soon | Certificate Holder |

<mdi-check-circle /> No manual polling needed — system proactively pushes status updates。

---
layout: section
color: orange-light
---

# Migration Plan & Hands-on Training

---
layout: top-title
color: gray-light
---

:: title ::
# Migration Plan & Timeline

:: content ::
<mdi-map-marker-path /> We are currently in the process of obtaining official accreditation.

**Now:** Old CA `cagrid.ihep.ac.cn` is running. New CA presented at **IGTF**, under **APGridPMA** review.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

```mermaid {scale: 0.6}
timeline
    title Migration Timeline
    Now : Old CA running
        : New CA under review
    Approval : Email all users
            : New CA opens
    Parallel : Old CA (revoke only)
            : New CA (full service)
    End of 2026 : Old CA shut down
               : Old certs unrecognized
```

</div>

<mdi-alert /> After end of 2026, certificates issued by the old CA will **no longer be recognized**.


---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Login Page

:: content ::
<mdi-login /> Select **IHEP SSO** from the authentication method dropdown, then enter LDAP credentials.

<br>

<div style="text-align: center; max-width: 90%; margin: 0 auto;">

<div style="text-align: center; max-width: 90%; margin: 0 auto;">
  <img src="/1.login_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Home Dashboard

:: content ::
<mdi-home /> After login, you see the main dashboard with Workflows, Certificates, and quick actions.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/2.home_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Select Certificate Profile

:: content ::
<mdi-form-select /> Go to **Request** -> choose **IHEP User Certificate** or **IHEP Host Certificate**.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/3.profile_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Edit Subject

:: content ::
<mdi-account-edit /> System auto-fills identity fields. Confirm the subject DN and add organization/group info.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/4.edit_subject_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Certificate Info

:: content ::
<mdi-information /> Additional certificate metadata: validity period, key algorithm (RSA 4096), and intended usage.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/5.cert_info_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Review & Submit

:: content ::
<mdi-clipboard-check /> Final confirmation of all fields before submission. Review carefully, then submit.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/6.review_and_submit_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Key Password

:: content ::
<mdi-key-variant /> Server generates a password for private key. **Write it down** - needed later for PKCS#12 export.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/7.passwd_page.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Awaiting Approval

:: content ::
<mdi-clock-outline /> The request enters the RA workflow queue. You can track status in **My Workflows**.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/8.wait_approval.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Certificate Issued

:: content ::
<mdi-certificate /> After RA approval, the certificate is issued. You can now download it from **My Certificates**.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/9.cert_issued.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Download Certificate

:: content ::
<mdi-tray-arrow-down /> Download options include certificate file, PKCS#12 container, and CA certificate chain.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/10.cert_download.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Set Export Password

:: content ::
<mdi-lock /> Set a password to protect the PKCS#12 export file before downloading.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/11.set_export_passwd.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: top-title
color: gray-light
---

:: title ::
# Hands-on Training — Download Complete

:: content ::
<mdi-check-circle /> The certificate and private key have been successfully exported. Proceed to deploy.

<br>

<div style="text-align: center; max-width: 85%; margin: 0 auto;">

<div style="text-align: center; max-width: 85%; margin: 0 auto;">
  <img src="/12.final_downloaded.png" style="width: 100%; border-radius: 12px; border: 1px solid #e5e7eb;" />
</div>

</div>

---
layout: credits
color: navy
---

# Thank You

<mdi-certificate-outline /> IHEP Computing Center — PKI Team

OpenXPKI · Docker Compose · Certificate Lifecycle Automation

<mdi-web /> `gridca.ihep.ac.cn`
