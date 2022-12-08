using System.Linq;
using System.Xml.Linq;
using System.Xml.XPath;
using System.Xml;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Html2Markdown;
using Html2Markdown.Replacement;
using Html2Markdown.Scheme;
using System.Text.RegularExpressions;

namespace convert_schema
{
    class AttributeCompletionItem
    {
        public string name { get; set; }
        public string description { get; set; }
        public string detail { get; set; }
        public List<string> options { get; set; }
    }

    class Completion
    {
        public string name { get; set; }
        public string detail { get; set; }
        public string description { get; set; }
        public List<string> elements { get; set; }
        public List<AttributeCompletionItem> attributes { get; set; }
    }

    class Program
    {
        static readonly XmlNamespaceManager ns;

        static Program()
        {
            ns = new XmlNamespaceManager(new NameTable());
            ns.AddNamespace("xs", "http://www.w3.org/2001/XMLSchema");
        }

        static void Main(string[] args)
        {
            var doc = XDocument.Load(@"svg.xsd");

            var items = GetCompletions(doc).ToList();

            FetchDocumentation(items);

            var dict = items.ToDictionary(v => v.name, v => v);
            File.WriteAllText(@"../svg-schema.js", "var SvgSchema = " + JsonConvert.SerializeObject(dict, Newtonsoft.Json.Formatting.Indented));
        }

        private static string GetItemUrl(string name)
        {
            return $"https://developer.mozilla.org/en-US/docs/Web/SVG/Element/{name}";
        }

        private static void FetchDocumentation(IList<Completion> items)
        {
            var coreAttributes = GetItemDoc("https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core");
            var stylingAttributes = GetItemDoc("https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling");
            var presentationAttributes = GetItemDoc("https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation");

            // items.ForEach(item =>
            Parallel.ForEach(items, item =>
            {
                try
                {
                    var url = GetItemUrl(item.name);

                    if (item.name == "definition-src")
                        return;

                    var doc = GetItemDoc(url);

                    item.description = GetElementDescription(doc, item.name, GetItemUrl(item.name));
                    item.detail = $"svg element";

                    foreach (var attr in item.attributes)
                    {
                        if (SetAttributeDocumentation(attr, doc, "item", GetItemUrl(item.name)))
                            continue;
                        if (SetAttributeDocumentation(attr, coreAttributes, "core", "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Core"))
                            continue;
                        if (SetAttributeDocumentation(attr, stylingAttributes, "styling", "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Styling"))
                            continue;
                        if (SetAttributeDocumentation(attr, presentationAttributes, "presentation", "https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation"))
                            continue;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.ToString());
                }
            });
        }

        private static HtmlDocument GetItemDoc(string url)
        {
            using var client = new HttpClient();

            Console.WriteLine(url);

            var html = client.GetStringAsync(url).Result;
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            return doc;
        }

        private static string GetElementDescription(HtmlDocument doc, string elemName, string url)
        {
            var html = doc.DocumentNode.SelectSingleNode("//article/div")?.InnerHtml;
            if (html == null)
                return null;

            return FormatDescription(html, url);
        }

        private static bool SetAttributeDocumentation(AttributeCompletionItem item, HtmlDocument doc, string type, string url)
        {
            var dt = doc.DocumentNode.SelectNodes("//article//dl//dt/code/a");
            var dd = doc.DocumentNode.SelectNodes("//article//dl//dd");

            var dtFound = dt?.FirstOrDefault(n => n.InnerText == item.name);
            if (dtFound == null)
                return false;

            var index = dt.IndexOf(dtFound);
            var html = dd[index].InnerHtml;

            item.detail = $"svg {type} attribute";
            item.description = FormatDescription(html, url);
            return true;
        }

        static string FormatDescription(string html, string url)
        {
            var mdc = new Converter(new CustomScheme());
            var md = mdc.Convert(html);

            md = Regex.Replace(md, @"`\[(\S+)\]\((https:\/\/developer\.mozilla\.org\/[\S]+)\)`", @"[`$1`]($2)");

            md += $" [more...]({url})";
            return md;
        }

        private static IEnumerable<Completion> GetCompletions(XDocument doc)
        {
            foreach (var e in doc.Root.XPathSelectElements("xs:element", ns))
            {
                var name = e.Attribute("name").Value;

                var type = doc.XPathSelectElement($"//xs:complexType[@name='{name}Type']", ns);
                if (type != null)
                {
                    yield return new Completion
                    {
                        name = name,
                        elements = GetElements(type).ToList(),
                        attributes = GetAttributes(type).ToList()
                    };
                }
            }
        }

        private static IEnumerable<string> GetElements(XElement type)
        {
            foreach (var g in type.XPathSelectElements($".//xs:group[@ref]", ns))
            {
                var gref = g.Attribute("ref").Value;
                foreach (var e in type.Document.XPathSelectElements($"//xs:group[@name='{gref}']//xs:element[@name]", ns))
                {
                    yield return e.Attribute("name").Value;
                }
            }

            foreach (var e in type.XPathSelectElements($".//xs:element[@ref]", ns))
            {
                yield return e.Attribute("ref").Value;
            }
        }

        private static IEnumerable<AttributeCompletionItem> GetAttributes(XElement type)
        {
            foreach (var g in type.XPathSelectElements($".//xs:attributeGroup[@ref]", ns))
            {
                var gref = g.Attribute("ref").Value;
                foreach (var e in type.Document.XPathSelectElements($"//xs:attributeGroup[@name='{gref}']//xs:attribute[@name]", ns))
                {
                    yield return MakeAttributeCompletionItem(e);
                }
            }

            foreach (var a in type.XPathSelectElements($".//xs:attribute[@name]", ns))
            {
                yield return MakeAttributeCompletionItem(a);
            };
        }

        private static AttributeCompletionItem MakeAttributeCompletionItem(XElement a)
        {
            return new AttributeCompletionItem
            {
                name = a.Attribute("name").Value,
                options = GetAttributeOptions(a)
            };
        }

        class CustomScheme : IScheme
        {
            public Markdown _md = new Markdown();

            class PatternReplacer : IReplacer
            {
                public string Pattern { get; set; }

                public string Replacement { get; set; }
                public string Replace(string html)
                {
                    var regex = new Regex(Pattern);
                    return regex.Replace(html, Replacement);
                }
            }

            public IList<IReplacer> Replacers()
            {
                var replacers = new List<IReplacer>();

                replacers.Add(new PatternReplacer
                {
                    Pattern = @"<small>",
                    Replacement = @""
                });
                replacers.Add(new PatternReplacer
                {
                    Pattern = @"</small>",
                    Replacement = @""
                });
                replacers.Add(new PatternReplacer
                {
                    Pattern = @"/en-US/",
                    Replacement = @"https://developer.mozilla.org/en-US/"
                });
                replacers.Add(new PatternReplacer
                {
                    Pattern = @"/docs/web/",
                    Replacement = @"https://developer.mozilla.org/docs/web/"
                });
                replacers.AddRange(_md.Replacers());

                return replacers;
            }
        }

        private static List<string> GetAttributeOptions(XElement a)
        {
            var attrTypeName = a.Attribute("type")?.Value;
            if (attrTypeName == null)
                return null;

            var attrType = a.Document.XPathSelectElement($"//xs:simpleType[@name='{attrTypeName}']", ns);
            if (attrType == null)
                return null;

            var options = attrType.XPathSelectElements($".//xs:enumeration", ns).Select(x => x.Attribute("value").Value).ToList();
            if (options.Count == 0)
                return null;

            return options;
        }
    }
}
