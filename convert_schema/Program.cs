using System;
using System.Linq;
using System.Xml.Linq;
using System.Xml.XPath;
using System.Text.Json;
using System.Xml;
using System.Collections.Generic;

namespace convert_schema
{
    class Program
    {
        class CompletionItem
        {
            public string name { get; set; }
            public bool unique { get; set; }
            public bool required { get; set; }
        }

        class CompletionMatch
        {
            public string name { get; set; }
            public List<CompletionItem> elements { get; set; }
            public List<CompletionItem> attributes { get; set; }
        }

        static void Main(string[] args)
        {
            var doc = XDocument.Load(@"svg.xsd");

            XNamespace xs = "http://www.w3.org/2001/XMLSchema";

            var ns = new XmlNamespaceManager(new NameTable());
            ns.AddNamespace("xs", "http://www.w3.org/2001/XMLSchema");

            var json = doc.XPathSelectElements("/xs:element").Select(e => 
            {
                var name = e.Attribute("name").Value;
                var type = doc.XPathSelectElement($"//xs:complexType[@name='{name}Type']", ns);
                if (type == null)
                    return null;

                var elements = type.XPathSelectElements($"xs:sequence", ns)
                    .SelectMany(seq =>
                    {
                        var groupElements = seq.XPathSelectElements("xs:group")
                            .SelectMany(g =>
                            {
                                var name = g.Attribute("ref").Value;
                                return doc.XPathSelectElements($"/xs:group[@name='{name}//xs:element'");
                            });

                        var directElements = seq.XPathSelectElements($"xs:choice/xs:element", ns);

                        var allEelements = new List<XElement>()
                            .Concat(groupElements)
                            .Concat(directElements);
                            
                        return allEelements.Select(e => new CompletionItem
                        {
                            name = e.Attribute("ref").Value
                        }).ToList();

                    })
                    .ToList();

                return new CompletionMatch
                {
                    name = name,
                    elements = elements
                };
            })
            .Where(e => e != null)
            .ToList();

            var data = JsonSerializer.Serialize(json, new JsonSerializerOptions 
            { 
                WriteIndented = true
            });
        }
    }
}
