# README

## Table of Contents

1. [Unomi Setup](#unomi-setup)
   - [Prerequisites](#prerequisites)
   - [Project Setup](#project-setup)
2. [Running the Application](#running-the-application)
3. [Flow of Route](#flow-of-policy-count-route)
4. Postman Collection link
5. [Karaf Logs](#karaf-logs)
6. [Rules](#rules)
7. [Updates](#updates)

---

## Unomi Setup

### Prerequisites

Ensure you have the following installed:

- Docker
- Git

### Setting Up Unomi and Elasticsearch on Docker

Save the following as `docker-compose.yml`:

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.2
    environment:
      - discovery.type=single-node
    ports:
      - 9200:9200
    volumes:
      - ./elasticsearch-data:/usr/share/elasticsearch/data

  unomi:
    image: apache/unomi:1.5.7
    environment:
      - UNOMI_ELASTICSEARCH_ADDRESSES=elasticsearch:9200
      - UNOMI_THIRDPARTY_PROVIDER1_IPADDRESSES=0.0.0.0/0,::1,127.0.0.1
    ports:
      - 8181:8181
      - 9443:9443
      - 8102:8102
    links:
      - elasticsearch
    depends_on:
      - elasticsearch
    volumes:
      - ./unomi-data:/data
```

Run the following command to start the services:

```bash
docker-compose up -d
```

---

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ayush22667/cdp
   ```
2. Configure Environment Variables in the `.env` file for both backend and frontend:
   ```env
   UNOMI_API_URL=http://localhost:8181
   UNOMI_AUTH=a2FyYWY6a2FyYWY=
   ```

---

## Running the Application

Ensure Docker containers are running using:

```bash
docker-compose ps
```

Then start your application as needed.

---

## Flow of Policy Count Route

Here is an example of how the policy count route is called:

```http
GET http://localhost:3000/policy-count
```

1. **Client Request:** The GET request is sent to the `/policy-count` endpoint.
2. **Router Level:** The request is routed through `unomiRoute.js`.
3. **Controller Level:** The `getPolicyCountHandler` function handles the logic to process the request.
4. **Service Level:** The `policyService.js` sends a POST request to Unomi’s API using `/cxs/query/profile` to fetch policy count data.

---

## Postman Collection Link

[Postman Collection](https://cdp999-1033.postman.co/workspace/cdp-Workspace~be04364a-6eb9-4665-8106-a573e2f865f7/collection/39326112-9cd8ad75-f393-49ad-8c69-d663152262b0?action=share&creator=39326112&active-environment=39326112-8527a435-b7db-4a5a-a2f3-2de088866937)

## Karaf Logs

Check Karaf logs using the following command:

```bash
docker exec -it <docker-container-id> /bin/bash
cd /data
cd /log
tail -f karaf.log
```

---

## Rules

Here are the rules applied in Unomi:

### Copy Events to Profile
```json
{
  "metadata": {
    "id": "copyEventsToProfile",
    "name": "Copy Events to Profile",
    "description": "Automatically copies event properties to the corresponding profile."
  },
  "condition": {
    "type": "eventTypeCondition",
    "parameterValues": {
      "eventTypeId": "viewPolicy"
    }
  },
  "actions": [
    {
      "type": "allEventToProfilePropertiesAction",
      "parameterValues": {}
    }
  ]
}
```

### Merge Profiles on Register by Phone
```json
{
  "metadata": {
    "id": "mergeProfilesOnRegisterByPhone",
    "name": "Merge Profiles on Phone Number upon Register",
    "description": "Merges profiles that have the same phone number when a register event occurs."
  },
  "condition": {
    "type": "booleanCondition",
    "parameterValues": {
      "operator": "and",
      "subConditions": [
        {
          "type": "eventTypeCondition",
          "parameterValues": {
            "eventTypeId": "register"
          }
        },
        {
          "type": "profilePropertyCondition",
          "parameterValues": {
            "propertyName": "properties.phone",
            "comparisonOperator": "equals",
            "propertyValue": "eventProperty::properties.phone"
          }
        }
      ]
    }
  },
  "actions": [
    {
      "type": "mergeProfilesOnPropertyAction",
      "parameterValues": {
        "mergeProfilePropertyName": "phone",
        "mergeProfilePropertyValue": "eventProperty::properties.phone"
      }
    }
  ]
}
```

### Engagement Scoring Rule
```json
{
  "metadata": {
    "id": "engagementScoringRule",
    "name": "Engagement Scoring Rule",
    "description": "Adjusts user engagement score based on premium content interaction."
  },
  "condition": {
    "type": "eventTypeCondition",
    "parameterValues": {
      "eventTypeId": "premiumContentView"
    }
  },
  "actions": [
    {
      "type": "incrementPropertyAction",
      "parameterValues": {
        "propertyName": "engagementScore",
        "incrementValue": 10
      }
    },
    {
      "type": "setPropertyAction",
      "parameterValues": {
        "propertyName": "engagementScore",
        "propertyValue": {
          "expression": "profile.engagementScore + 10"
        }
      }
    }
  ]
}
```

---

## Updates

- Created segments to segregate users, policies, and claims.
- Added rules such as `copyEventsToProfile`, `mergeProfilesOnRegisterByPhone`, and `engagementScoringRule` for various event actions.


