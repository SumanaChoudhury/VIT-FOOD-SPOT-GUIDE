# Module 3 Academic Demo: XML, DTD, and XML Schema (XSD)

## 1. Overview & Context
This academic demonstration fulfills syllabus requirements for **Module 3: Client-Side Scripting & Data Representation (XML, DTD, XSD)**.

In modern enterprise architectures, XML remains a critical standard for formal contract validation, inter-system financial integration, and regulatory reporting. The **VIT Food Spot Guide** implements a production XML export endpoint:
```http
GET /api/export/xml
```
which dynamically serializes the entire MongoDB food spot and menu hierarchy into a validated XML document.

---

## 2. Component Files
1. **`foodspots.dtd`**: The Document Type Definition specifying elements, attribute lists, element multiplicity (`*`, `+`, `?`), and entity nesting.
2. **`foodspots.xsd`**: The W3C XML Schema Definition enforcing strong data types (`xs:dateTime`, `xs:nonNegativeInteger`, `xs:string`), enumerated restrictions (`veg`, `non-veg`, `vegan`, `unclassified`), and element cardinality (`minOccurs`, `maxOccurs`).
3. **`sample-foodspots.xml`**: A canonical test document demonstrating valid instances of multi-counter food spots (One Food World), single spots (Nama Chai), and spots with missing menus (Good Vibes).

---

## 3. Comparison: DTD vs. XML Schema (XSD)

| Feature | DTD (Document Type Definition) | XSD (XML Schema Definition) |
|---|---|---|
| **Syntax** | Non-XML proprietary BNF-style grammar | Standard XML syntax (`<xs:schema>`) |
| **Data Typing** | Rudimentary: text only (`#PCDATA`, `CDATA`) | Rich data types (`integer`, `decimal`, `date`, `boolean`, `pattern`) |
| **Namespace Support** | No native XML namespace awareness | Full namespace support (`targetNamespace`, `xmlns:xs`) |
| **Value Constraints** | Basic enumeration | Powerful facet restrictions (`minInclusive`, `pattern`, `enumeration`) |
| **Extensibility** | Closed and inflexible | Highly extensible via type derivation and substitution groups |

---

## 4. How to Validate Locally

### Using xmllint (Command line / Linux / macOS)
```bash
# Validate against DTD
xmllint --noout --dtdvalid academic-demos/xml/foodspots.dtd academic-demos/xml/sample-foodspots.xml

# Validate against XSD Schema
xmllint --noout --schema academic-demos/xml/foodspots.xsd academic-demos/xml/sample-foodspots.xml
```

### Using Node.js or Java
The Node.js backend validates dynamic XML output structure before streaming. You can also inspect the live XML feed at:
`http://localhost:5000/api/export/xml`
