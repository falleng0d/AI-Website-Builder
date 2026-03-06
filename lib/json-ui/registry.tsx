import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
  components: {
    // Layout
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,

    // Navigation
    Tabs: shadcnComponents.Tabs,
    Accordion: shadcnComponents.Accordion,
    Collapsible: shadcnComponents.Collapsible,
    Pagination: shadcnComponents.Pagination,

    // Overlay
    // Dialog: shadcnComponents.Dialog,
    Drawer: shadcnComponents.Drawer,
    Tooltip: shadcnComponents.Tooltip,
    Popover: shadcnComponents.Popover,
    DropdownMenu: shadcnComponents.DropdownMenu,

    // Content
    Heading: shadcnComponents.Heading,
    Text: shadcnComponents.Text,
    Image: shadcnComponents.Image,
    Avatar: shadcnComponents.Avatar,
    Badge: shadcnComponents.Badge,
    Alert: shadcnComponents.Alert,
    Carousel: shadcnComponents.Carousel,
    Table: shadcnComponents.Table,

    // Feedback
    Progress: shadcnComponents.Progress,
    Skeleton: shadcnComponents.Skeleton,
    // Spinner: shadcnComponents.Spinner,

    // Input
    Button: shadcnComponents.Button,
    Link: shadcnComponents.Link,
    Input: shadcnComponents.Input,
    Textarea: shadcnComponents.Textarea,
    Select: shadcnComponents.Select,
    Checkbox: shadcnComponents.Checkbox,
    Radio: shadcnComponents.Radio,
    Switch: shadcnComponents.Switch,
    Slider: shadcnComponents.Slider,
    Toggle: shadcnComponents.Toggle,
    ToggleGroup: shadcnComponents.ToggleGroup,
    ButtonGroup: shadcnComponents.ButtonGroup,
  },
});
