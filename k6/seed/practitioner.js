export default
{
  "active": true,
  "address": [
    {
      "city": "ROXBURY",
      "line": [
        "2343 WASHINGTON ST"
      ],
      "state": "MA",
      "country": "US",
      "postalCode": "021193200"
    }
  ],
  "extension": [
    {
      "url": "http://synthetichealth.github.io/synthea/utilization-encounters-extension",
      "valueInteger": 11
    }
  ],
  "gender": "female",
  "identifier": [
    {
      "value": "9999917195",
      "system": "http://hl7.org/fhir/sid/us-npi"
    }
  ],
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner"
    ],
    "extension": [
      {
        "url": "ex:createdAt",
        "valueInstant": "2024-10-17T12:36:14.656761Z"
      }
    ]
  },
  "name": [
    {
      "given": [
        "Alysia"
      ],
      "family": "Franecki",
      "prefix": [
        "Dr."
      ]
    }
  ],
  "resourceType": "Practitioner",
  "telecom": [
    {
      "use": "work",
      "value": "Alysia.Franecki@example.com",
      "system": "email",
      "extension": [
        {
          "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-direct",
          "valueBoolean": true
        }
      ]
    }
  ]
}
