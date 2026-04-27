# Form Modules API

Base prefix: `/api/v1`

## Public Endpoints

### Get active form module

`GET /forms/:businessUnit/:slug`

Allowed `businessUnit` values:

- `enterprise`
- `fiber`
- `media`

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessUnit": "ENTERPRISE",
    "slug": "enterprise-consultation",
    "name": "Enterprise Consultation",
    "category": "REGISTRATION",
    "handlingMode": "SUBMISSION",
    "status": "ACTIVE",
    "schemaVersion": 1,
    "defaultLocale": "id",
    "publicPath": "/id/enterprise/form",
    "steps": [],
    "fields": [],
    "rules": [],
    "responseConfigs": []
  }
}
```

### Submit form module

`POST /forms/:businessUnit/:slug/submissions`

Request body:

```json
{
  "locale": "id",
  "requestId": "optional-request-id",
  "sessionId": "optional-session-id",
  "sourcePath": "/id/enterprise/form",
  "values": {
    "FirstName": "Yuta",
    "LastName": "Okotsu",
    "Email": "yuta@example.com",
    "Promo_Website__c": "Enterprise Consultation Form"
  },
  "groups": [
    {
      "groupKey": "participants",
      "sortOrder": 0,
      "label": "Primary Participant",
      "values": {
        "firstName": "Yuta",
        "lastName": "Okotsu",
        "companyEmail": "yuta@example.com"
      }
    }
  ],
  "files": [
    {
      "fieldPath": "companySignatureFile",
      "fieldKey": "companySignatureFile",
      "fileId": "uploaded-file-uuid",
      "originalName": "signature.pdf",
      "mimeType": "application/pdf",
      "size": 102400,
      "url": "/uploads/signature.pdf",
      "status": "UPLOADED"
    }
  ]
}
```

Behavior:

- `handlingMode=SUBMISSION`: stores submission, values, repeater groups, files, then immediately processes dispatch logs to terminal states (`SUCCESS`, `FAILED`, or `SKIPPED`).
- `handlingMode=ROUTING_ONLY`: resolves response config without persisting a submission.
- A startup + cron sweep also processes any dispatch logs that remain `PENDING`.

Response:

```json
{
  "success": true,
  "message": "Form submission stored successfully",
  "data": {
    "persisted": true,
    "submission": {
      "id": "uuid"
    },
    "response": {
      "key": "default-success",
      "responseType": "SUCCESS",
      "path": "/id/enterprise/form/success",
      "query": {
        "name": "Yuta"
      }
    }
  }
}
```

## CMS Endpoints

All CMS endpoints require bearer auth and RBAC.

### List form modules

`GET /cms/form-modules?page=1&limit=10&search=&businessUnit=ENTERPRISE&status=ACTIVE&category=REGISTRATION`

### Get form module detail

`GET /cms/form-modules/:id`

### Create form module

`POST /cms/form-modules`

Request body:

```json
{
  "businessUnit": "ENTERPRISE",
  "slug": "enterprise-consultation",
  "name": "Enterprise Consultation",
  "description": "4-step enterprise consultation form",
  "category": "REGISTRATION",
  "handlingMode": "SUBMISSION",
  "status": "ACTIVE",
  "schemaVersion": 1,
  "defaultLocale": "id",
  "publicPath": "/id/enterprise/form",
  "sourceWebsite": "Enterprise Website",
  "promoWebsite": "Enterprise Consultation",
  "leadSource": "Website",
  "integrationProvider": "CRM_WEB_TO_LEAD",
  "definition": {
    "steps": [
      {
        "key": "need-personal",
        "title": "Need & Personal Details",
        "stepNumber": 1,
        "actionLabel": "Next"
      }
    ],
    "fields": [
      {
        "key": "FirstName",
        "path": "FirstName",
        "label": "First Name",
        "fieldType": "TEXT",
        "formStepKey": "need-personal",
        "sortOrder": 1,
        "isRequired": true,
        "payloadKey": "FirstName"
      }
    ],
    "options": [],
    "rules": [],
    "responseConfigs": [
      {
        "key": "default-success",
        "responseType": "SUCCESS",
        "pathTemplate": "/{locale}/enterprise/form/success",
        "queryTemplate": {
          "name": "{FirstName}"
        },
        "isDefault": true
      }
    ],
    "integrationConfigs": [
      {
        "key": "crm-primary",
        "provider": "CRM_WEB_TO_LEAD",
        "dispatchMode": "ASYNC"
      }
    ]
  }
}
```

### Update form module

`PUT /cms/form-modules/:id`

Notes:

- Metadata-only update: send only top-level properties.
- Full schema replacement: set `replaceDefinition=true` and send a complete `definition` object.

Example:

```json
{
  "status": "ACTIVE",
  "replaceDefinition": true,
  "definition": {
    "steps": [],
    "fields": [],
    "options": [],
    "rules": [],
    "responseConfigs": [],
    "integrationConfigs": []
  }
}
```

### Archive form module

`DELETE /cms/form-modules/:id`

Behavior:

- soft delete by setting `deletedAt`
- status forced to `ARCHIVED`

### List submissions for a form module

`GET /cms/form-modules/:id/submissions?page=1&limit=10&status=STORED&search=yuta`

### Get submission detail

`GET /cms/form-modules/:id/submissions/:submissionId`

### Retry failed submission dispatch

`POST /cms/form-modules/:id/submissions/:submissionId/retry-dispatch`

Behavior:

- resets failed dispatch logs for the selected submission back to `PENDING`
- increments dispatch attempt count
- immediately reprocesses the dispatch logs and returns the refreshed submission detail

Returns:

- submission header
- field values
- repeater group rows
- file rows
- dispatch logs

## Current implementation scope

- complete Prisma data model for BU-separated form modules and submissions
- public read + submit endpoints
- CMS list/detail/create/update/archive endpoints
- CMS list/detail submission endpoints
- immediate dispatch processor for `form_submission_dispatch_logs`
- startup + cron sweep for leftover pending dispatch logs
- CMS retry endpoint for failed dispatch logs
- support for repeater groups such as event participants
- support for submission-linked files such as Fiber documents
- support for conditional response routing metadata

## Follow-up backend work

- CMS endpoints for partial schema editing per step or field
- bootstrap seed for Enterprise, Fiber, and Media modules
- file upload orchestration for Fiber registration flow
- server-side rule evaluation beyond simple equality or includes matching
- real integration endpoint configuration per BU/module so CRM-bound submissions can finish with `SUCCESS` instead of `FAILED`

## Bootstrap runbook

Module-scoped command sequence:

```bash
npm run db:migrate:deploy
npm run db:seed:form-modules
```

Notes:

- `db:seed:form-modules` only seeds the form module subsystem and does not run the legacy content seed flow.
- Existing modules are only updated when their `submissionSettings.managedBy` is `bootstrap-seed`.
- Archived modules are skipped to avoid reviving deleted CMS records unexpectedly.
- Manually created or manually edited modules are skipped by the bootstrap seeder to avoid overwriting CMS-managed data.