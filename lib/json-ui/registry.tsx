import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { ContentContainer } from "@/components/json-ui/content-container";
import { FullWidthSection } from "@/components/json-ui/full-width-section";
import { HeroCentered } from "@/components/json-ui/hero-centered";
import { HeroFeatured } from "@/components/json-ui/hero-featured";
import { HeroSplit } from "@/components/json-ui/hero-split";
import { SiteHeaderCTA } from "@/components/json-ui/site-header-cta";
import { SiteHeaderNav } from "@/components/json-ui/site-header-nav";
import { SiteHeaderSimple } from "@/components/json-ui/site-header-simple";
import { SplitContainer } from "@/components/json-ui/split-container";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
  components: {
    // Layout
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,
    FullWidthSection,
    ContentContainer,
    SplitContainer,

    // Navigation
    Tabs: shadcnComponents.Tabs,
    Accordion: shadcnComponents.Accordion,
    Collapsible: shadcnComponents.Collapsible,
    Pagination: shadcnComponents.Pagination,
    SiteHeaderSimple,
    SiteHeaderNav,
    SiteHeaderCTA,

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
    HeroCentered,
    HeroSplit,
    HeroFeatured,

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
