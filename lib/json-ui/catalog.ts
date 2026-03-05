"use client";

import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";

export const catalog = defineCatalog(schema, {
  components: {
    // Layout
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,

    // Navigation
    Tabs: shadcnComponentDefinitions.Tabs,
    Accordion: shadcnComponentDefinitions.Accordion,
    Collapsible: shadcnComponentDefinitions.Collapsible,
    Pagination: shadcnComponentDefinitions.Pagination,

    // Overlay
    Dialog: shadcnComponentDefinitions.Dialog,
    Drawer: shadcnComponentDefinitions.Drawer,
    Tooltip: shadcnComponentDefinitions.Tooltip,
    Popover: shadcnComponentDefinitions.Popover,
    DropdownMenu: shadcnComponentDefinitions.DropdownMenu,

    // Content
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Image: shadcnComponentDefinitions.Image,
    Avatar: shadcnComponentDefinitions.Avatar,
    Badge: shadcnComponentDefinitions.Badge,
    Alert: shadcnComponentDefinitions.Alert,
    Carousel: shadcnComponentDefinitions.Carousel,
    Table: shadcnComponentDefinitions.Table,

    // Feedback
    Progress: shadcnComponentDefinitions.Progress,
    Skeleton: shadcnComponentDefinitions.Skeleton,
    Spinner: shadcnComponentDefinitions.Spinner,

    // Input
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
