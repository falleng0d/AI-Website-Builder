/**
 * Generates the catalog prompt string for server-side use.
 * This avoids importing @json-render/react (which uses React.createContext)
 * in server-side code.
 *
 * Usage: node scripts/generate-catalog-prompt.js
 */
const { defineCatalog } = require("@json-render/core");
const { schema } = require("@json-render/react");
const { shadcnComponentDefinitions } = require("@json-render/shadcn/catalog");
const fs = require("node:fs");
const path = require("node:path");

const catalog = defineCatalog(schema, {
  components: {
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,
    Tabs: shadcnComponentDefinitions.Tabs,
    Accordion: shadcnComponentDefinitions.Accordion,
    Collapsible: shadcnComponentDefinitions.Collapsible,
    Pagination: shadcnComponentDefinitions.Pagination,
    Dialog: shadcnComponentDefinitions.Dialog,
    Drawer: shadcnComponentDefinitions.Drawer,
    Tooltip: shadcnComponentDefinitions.Tooltip,
    Popover: shadcnComponentDefinitions.Popover,
    DropdownMenu: shadcnComponentDefinitions.DropdownMenu,
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Image: shadcnComponentDefinitions.Image,
    Avatar: shadcnComponentDefinitions.Avatar,
    Badge: shadcnComponentDefinitions.Badge,
    Alert: shadcnComponentDefinitions.Alert,
    Carousel: shadcnComponentDefinitions.Carousel,
    Table: shadcnComponentDefinitions.Table,
    Progress: shadcnComponentDefinitions.Progress,
    Skeleton: shadcnComponentDefinitions.Skeleton,
    Spinner: shadcnComponentDefinitions.Spinner,
    Button: shadcnComponentDefinitions.Button,
    Link: shadcnComponentDefinitions.Link,
    Input: shadcnComponentDefinitions.Input,
    Textarea: shadcnComponentDefinitions.Textarea,
    Select: shadcnComponentDefinitions.Select,
    Checkbox: shadcnComponentDefinitions.Checkbox,
    Radio: shadcnComponentDefinitions.Radio,
    Switch: shadcnComponentDefinitions.Switch,
    Slider: shadcnComponentDefinitions.Slider,
    Toggle: shadcnComponentDefinitions.Toggle,
    ToggleGroup: shadcnComponentDefinitions.ToggleGroup,
    ButtonGroup: shadcnComponentDefinitions.ButtonGroup,
  },
  actions: {},
});

const prompt = catalog.prompt();
const mdPath = path.join(__dirname, "catalogue.md");

fs.writeFileSync(mdPath, prompt);

console.log(`Catalog markdown written → ${mdPath}`);
