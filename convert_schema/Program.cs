using System.Linq;
using System.Xml.Linq;
using System.Xml.XPath;
using System.Xml;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

namespace convert_schema
{
    class Program
    {
        class ElementCompletionItem
        {
            public string name { get; set; }
        }

        class AttributeCompletionItem
        {
            public string name { get; set; }
        }

        class Completion
        {
            public List<ElementCompletionItem> elements { get; set; }
            public List<AttributeCompletionItem> attributes { get; set; }
        }

        static readonly XmlNamespaceManager ns;

        static Program()
        {
            ns = new XmlNamespaceManager(new NameTable());
            ns.AddNamespace("xs", "http://www.w3.org/2001/XMLSchema");
        }

        static void Main(string[] args)
        {
            var doc = XDocument.Load(@"svg.xsd");

            var items = GetCompletions(doc).ToDictionary(kvp => kvp.Item1, kvp => kvp.Item2);
            File.WriteAllText(@"svg-schema.js", "var SvgSchema = " + JsonConvert.SerializeObject(items, Newtonsoft.Json.Formatting.Indented));
        }

        private static IEnumerable< (string, Completion) > GetCompletions(XDocument doc)
        {
            foreach (var e in doc.Root.XPathSelectElements("xs:element", ns))
            {
                var name = e.Attribute("name").Value;

                var type = doc.XPathSelectElement($"//xs:complexType[@name='{name}Type']", ns);
                if (type != null)
                {
                    yield return (name, new Completion
                    {
                        elements = GetElements(type).ToList(),
                        attributes = GetAttributes(type).ToList()
                    });
                }
            }

        }

        private static IEnumerable<ElementCompletionItem> GetElements(XElement type)
        {
            foreach (var g in type.XPathSelectElements($".//xs:group[@ref]", ns))
            {
                var gref = g.Attribute("ref").Value;
                foreach (var e in type.Document.XPathSelectElements($"//xs:group[@name='{gref}']//xs:element[@name]", ns))
                {
                    yield return new ElementCompletionItem
                    {
                        name = e.Attribute("name").Value
                    };
                }
            }

            foreach (var e in type.XPathSelectElements($".//xs:element[@ref]", ns))
            {
                yield return new ElementCompletionItem
                {
                    name = e.Attribute("ref").Value
                };
            }
        }

        private static IEnumerable<AttributeCompletionItem> GetAttributes(XElement type)
        {
            foreach (var g in type.XPathSelectElements($".//xs:attributeGroup[@ref]", ns))
            {
                var gref = g.Attribute("ref").Value;
                foreach (var e in type.Document.XPathSelectElements($"//xs:attributeGroup[@name='{gref}']//xs:attribute[@name]", ns))
                {
                    yield return new AttributeCompletionItem
                    {
                        name = e.Attribute("name").Value
                    };
                }
            }

            foreach (var a in type.XPathSelectElements($".//xs:attribute[@name]", ns))
            {
                yield return new AttributeCompletionItem
                {
                    name = a.Attribute("name").Value
                };
            };
        }

    }
}
