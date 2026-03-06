import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod/v4";

const linkItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const statSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const toneSchema = z.enum(["default", "muted", "accent", "primary"]);
const surfaceSchema = z.enum(["none", "soft", "card"]);
const paddingYSchema = z.enum(["sm", "md", "lg", "xl"]);
const alignSchema = z.enum(["left", "center"]);
const wrapperVariantSchema = z.enum(["default", "inset", "elevated"]);
const headerVariantSchema = z.enum(["default", "frosted", "minimal"]);
const heroVariantSchema = z.enum(["default", "spotlight", "framed"]);

export const catalog = defineCatalog(schema, {
  components: {
    // Layout
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,
    FullWidthSection: {
      props: z.object({
        tone: toneSchema.optional(),
        surface: surfaceSchema.optional(),
        paddingY: paddingYSchema.optional(),
        variant: wrapperVariantSchema.optional(),
        showDivider: z.boolean().optional(),
      }),
      slots: ["default"],
      description: "Full-width page section with semantic background and spacing controls.",
    },
    ContentContainer: {
      props: z.object({
        maxWidth: z.enum(["md", "lg", "xl", "2xl", "full"]).optional(),
        align: alignSchema.optional(),
        variant: wrapperVariantSchema.optional(),
      }),
      slots: ["default"],
      description: "Centered content wrapper for section interiors and page composition.",
    },
    SplitContainer: {
      props: z.object({
        ratio: z.enum(["equal", "content-heavy", "visual-heavy"]).optional(),
        gap: z.enum(["md", "lg", "xl"]).optional(),
      }),
      slots: ["default"],
      description: "Responsive two-column layout for content and visuals.",
    },

    // Navigation
    Tabs: shadcnComponentDefinitions.Tabs,
    Accordion: shadcnComponentDefinitions.Accordion,
    Collapsible: shadcnComponentDefinitions.Collapsible,
    Pagination: shadcnComponentDefinitions.Pagination,
    SiteHeaderSimple: {
      props: z.object({
        brand: z.string(),
        logoSvgRef: z.string().optional(),
        navItems: z.array(linkItemSchema).optional(),
        variant: headerVariantSchema.optional(),
      }),
      description: "Compact site header with brand and optional navigation links.",
    },
    SiteHeaderNav: {
      props: z.object({
        brand: z.string(),
        logoSvgRef: z.string().optional(),
        navItems: z.array(linkItemSchema),
        activeItem: z.string().optional(),
        secondaryText: z.string().optional(),
        variant: headerVariantSchema.optional(),
      }),
      description: "Navigation-focused site header with active state and supporting text.",
    },
    SiteHeaderCTA: {
      props: z.object({
        brand: z.string(),
        logoSvgRef: z.string().optional(),
        navItems: z.array(linkItemSchema).optional(),
        ctaLabel: z.string().optional(),
        ctaHref: z.string().optional(),
        secondaryCtaLabel: z.string().optional(),
        secondaryCtaHref: z.string().optional(),
        announcement: z.string().optional(),
        sticky: z.boolean().optional(),
        showBorder: z.boolean().optional(),
        variant: headerVariantSchema.optional(),
      }),
      description: "Header with navigation, announcement copy, and primary call-to-action buttons.",
    },

    // Overlay
    // Dialog: shadcnComponentDefinitions.Dialog,
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
    HeroCentered: {
      props: z.object({
        badge: z.string().optional(),
        eyebrow: z.string().optional(),
        title: z.string(),
        description: z.string(),
        primaryCtaLabel: z.string().optional(),
        primaryCtaHref: z.string().optional(),
        secondaryCtaLabel: z.string().optional(),
        secondaryCtaHref: z.string().optional(),
        note: z.string().optional(),
        imageSvgRef: z.string().optional(),
        variant: heroVariantSchema.optional(),
      }),
      description: "Centered hero section with headline, supporting copy, CTAs, and optional SVG artwork.",
    },
    HeroSplit: {
      props: z.object({
        badge: z.string().optional(),
        eyebrow: z.string().optional(),
        title: z.string(),
        description: z.string(),
        primaryCtaLabel: z.string().optional(),
        primaryCtaHref: z.string().optional(),
        secondaryCtaLabel: z.string().optional(),
        secondaryCtaHref: z.string().optional(),
        note: z.string().optional(),
        imageSvgRef: z.string().optional(),
        imagePosition: z.enum(["left", "right"]).optional(),
        variant: heroVariantSchema.optional(),
      }),
      description: "Two-column hero with copy on one side and SVG artwork on the other.",
    },
    HeroFeatured: {
      props: z.object({
        badge: z.string().optional(),
        eyebrow: z.string().optional(),
        title: z.string(),
        description: z.string(),
        primaryCtaLabel: z.string().optional(),
        primaryCtaHref: z.string().optional(),
        secondaryCtaLabel: z.string().optional(),
        secondaryCtaHref: z.string().optional(),
        note: z.string().optional(),
        imageSvgRef: z.string().optional(),
        stats: z.array(statSchema).optional(),
        featureItems: z.array(z.string()).optional(),
        variant: heroVariantSchema.optional(),
      }),
      description: "Feature-rich hero with artwork, feature bullets, and stat callouts.",
    },

    // Feedback
    Progress: shadcnComponentDefinitions.Progress,
    Skeleton: shadcnComponentDefinitions.Skeleton,
    // Spinner: shadcnComponentDefinitions.Spinner,

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
