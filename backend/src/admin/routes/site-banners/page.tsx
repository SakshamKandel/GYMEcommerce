import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Palette } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
  Toaster,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

/**
 * Site Banners — merchant-owned announcement strips.
 *
 * Everything the storefront renders for a banner is controlled here: the
 * phrases, colors, alignment, static vs scrolling ticker, placement, order —
 * and the master Active switch that removes the strip from the site entirely
 * (the storefront re-reads config within ~60 seconds).
 */

type Banner = {
  id: string
  name: string
  placement: "announcement_top" | "footer_ticker"
  messages: string[]
  link_url: string | null
  background_color: string
  text_color: string
  alignment: "left" | "center" | "right"
  display_mode: "static" | "marquee"
  is_active: boolean
  sort_order: number
}

type EditorState = Omit<Banner, "id" | "messages"> & {
  id?: string
  messagesText: string
}

const EMPTY_EDITOR: EditorState = {
  name: "",
  placement: "announcement_top",
  messagesText: "",
  link_url: null,
  background_color: "#E63946",
  text_color: "#FAFAF7",
  alignment: "center",
  display_mode: "static",
  is_active: true,
  sort_order: 0,
}

const PLACEMENT_LABELS: Record<Banner["placement"], string> = {
  announcement_top: "Top bar (above nav)",
  footer_ticker: "Footer ticker",
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/admin/site-banners${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.message || `Request failed (${res.status})`)
  }
  return body
}

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) => (
  <div className="flex flex-col gap-y-1">
    <Label size="small">{label}</Label>
    <div className="flex items-center gap-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 cursor-pointer rounded border border-ui-border-base bg-ui-bg-field p-0.5"
        aria-label={`${label} color picker`}
      />
      <Input
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#E63946"
        className="w-28 font-mono"
      />
    </div>
  </div>
)

const BannerPreview = ({ state }: { state: EditorState }) => {
  const messages = state.messagesText
    .split("\n")
    .map((m) => m.trim())
    .filter(Boolean)

  const justify =
    state.alignment === "left"
      ? "flex-start"
      : state.alignment === "right"
        ? "flex-end"
        : "center"

  return (
    <div className="flex flex-col gap-y-1">
      <Label size="small">Live preview</Label>
      <div
        className="w-full overflow-hidden rounded"
        style={{ backgroundColor: state.background_color, color: state.text_color }}
      >
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 font-mono text-xs uppercase tracking-widest"
          style={{ justifyContent: justify }}
        >
          {messages.length ? (
            messages.map((message, i) => (
              <span key={i} className="flex items-center gap-x-3">
                {i > 0 && <span style={{ opacity: 0.7 }}>✱</span>}
                <span>{message}</span>
              </span>
            ))
          ) : (
            <span style={{ opacity: 0.6 }}>Add a message line below…</span>
          )}
        </div>
      </div>
      {state.display_mode === "marquee" && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          Marquee mode scrolls these phrases continuously on the storefront.
        </Text>
      )}
    </div>
  )
}

const SiteBannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [saving, setSaving] = useState(false)
  const prompt = usePrompt()

  const refresh = useCallback(async () => {
    try {
      const { banners } = await api("")
      setBanners(banners)
    } catch (e: any) {
      toast.error("Failed to load banners", { description: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openCreate = () => setEditor({ ...EMPTY_EDITOR })

  const openEdit = (banner: Banner) =>
    setEditor({
      ...banner,
      messagesText: (banner.messages ?? []).join("\n"),
    })

  const save = async () => {
    if (!editor) return
    const messages = editor.messagesText
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean)

    if (!editor.name.trim() || !messages.length) {
      toast.error("Name and at least one message line are required")
      return
    }

    const payload = {
      name: editor.name,
      placement: editor.placement,
      messages,
      link_url: editor.link_url || null,
      background_color: editor.background_color,
      text_color: editor.text_color,
      alignment: editor.alignment,
      display_mode: editor.display_mode,
      is_active: editor.is_active,
      sort_order: editor.sort_order,
    }

    setSaving(true)
    try {
      if (editor.id) {
        await api(`/${editor.id}`, { method: "POST", body: JSON.stringify(payload) })
        toast.success("Banner updated")
      } else {
        await api("", { method: "POST", body: JSON.stringify(payload) })
        toast.success("Banner created")
      }
      setEditor(null)
      await refresh()
    } catch (e: any) {
      toast.error("Save failed", { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (banner: Banner) => {
    // Optimistic flip — the storefront picks the change up within ~60s.
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: !b.is_active } : b))
    )
    try {
      await api(`/${banner.id}`, {
        method: "POST",
        body: JSON.stringify({ is_active: !banner.is_active }),
      })
      toast.success(!banner.is_active ? "Banner shown on site" : "Banner removed from site")
    } catch (e: any) {
      toast.error("Toggle failed", { description: e.message })
      await refresh()
    }
  }

  const remove = async (banner: Banner) => {
    const confirmed = await prompt({
      title: `Delete "${banner.name}"?`,
      description:
        "This permanently deletes the banner. To hide it temporarily, use the Active switch instead.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (!confirmed) return
    try {
      await api(`/${banner.id}`, { method: "DELETE" })
      toast.success("Banner deleted")
      await refresh()
    } catch (e: any) {
      toast.error("Delete failed", { description: e.message })
    }
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Site Banners</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Announcement strips on the storefront — text, colors, alignment,
            placement. Flip a banner off to remove it from the site.
          </Text>
        </div>
        <Button size="small" onClick={openCreate}>
          Create banner
        </Button>
      </div>

      {editor && (
        <div className="flex flex-col gap-y-4 px-6 py-5 bg-ui-bg-subtle">
          <Heading level="h2">{editor.id ? "Edit banner" : "New banner"}</Heading>

          <BannerPreview state={editor} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-y-1">
              <Label size="small">Name (internal)</Label>
              <Input
                size="small"
                value={editor.name}
                onChange={(e) => setEditor({ ...editor, name: e.target.value })}
                placeholder="Top announcement"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label size="small">Placement</Label>
              <Select
                size="small"
                value={editor.placement}
                onValueChange={(v) =>
                  setEditor({ ...editor, placement: v as Banner["placement"] })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-1 md:col-span-2">
              <Label size="small">Messages — one line per phrase (shown ✱-separated)</Label>
              <Textarea
                rows={3}
                value={editor.messagesText}
                onChange={(e) => setEditor({ ...editor, messagesText: e.target.value })}
                placeholder={"Cash on Delivery all over Nepal\n100% Authentic\nFree delivery over Rs. 10,000"}
              />
            </div>

            <ColorField
              label="Background color"
              value={editor.background_color}
              onChange={(v) => setEditor({ ...editor, background_color: v })}
            />
            <ColorField
              label="Text color"
              value={editor.text_color}
              onChange={(v) => setEditor({ ...editor, text_color: v })}
            />

            <div className="flex flex-col gap-y-1">
              <Label size="small">Alignment (static mode)</Label>
              <Select
                size="small"
                value={editor.alignment}
                onValueChange={(v) =>
                  setEditor({ ...editor, alignment: v as Banner["alignment"] })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="left">Left</Select.Item>
                  <Select.Item value="center">Center</Select.Item>
                  <Select.Item value="right">Right</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label size="small">Display mode</Label>
              <Select
                size="small"
                value={editor.display_mode}
                onValueChange={(v) =>
                  setEditor({ ...editor, display_mode: v as Banner["display_mode"] })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="static">Static strip</Select.Item>
                  <Select.Item value="marquee">Scrolling marquee</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label size="small">Link URL (optional — whole strip clickable)</Label>
              <Input
                size="small"
                value={editor.link_url ?? ""}
                onChange={(e) => setEditor({ ...editor, link_url: e.target.value })}
                placeholder="/np/store"
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Label size="small">Sort order (lower shows first)</Label>
              <Input
                size="small"
                type="number"
                value={String(editor.sort_order)}
                onChange={(e) =>
                  setEditor({ ...editor, sort_order: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div className="flex items-center gap-x-2 md:col-span-2">
              <Switch
                checked={editor.is_active}
                onCheckedChange={(checked) => setEditor({ ...editor, is_active: checked })}
                id="banner-active"
              />
              <Label htmlFor="banner-active">Active — visible on the storefront</Label>
            </div>
          </div>

          <div className="flex gap-x-2">
            <Button size="small" onClick={save} isLoading={saving}>
              {editor.id ? "Save changes" : "Create banner"}
            </Button>
            <Button size="small" variant="secondary" onClick={() => setEditor(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-subtle">Loading…</Text>
        ) : banners.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No banners yet — create one to put a strip on the storefront.
          </Text>
        ) : (
          <div className="flex flex-col divide-y">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-x-4 py-3">
                <div
                  className="h-8 w-16 shrink-0 rounded border border-ui-border-base"
                  style={{ backgroundColor: banner.background_color }}
                  title={banner.background_color}
                >
                  <div
                    className="flex h-full items-center justify-center font-mono text-[9px] uppercase"
                    style={{ color: banner.text_color }}
                  >
                    Aa ✱
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <Text weight="plus" size="small" className="truncate">
                    {banner.name}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle truncate">
                    {(banner.messages ?? []).join(" ✱ ")}
                  </Text>
                </div>
                <Badge size="2xsmall">{PLACEMENT_LABELS[banner.placement]}</Badge>
                <Badge size="2xsmall">
                  {banner.display_mode === "marquee" ? "Marquee" : "Static"}
                </Badge>
                <div className="flex items-center gap-x-1.5">
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => toggleActive(banner)}
                    aria-label={`Toggle ${banner.name}`}
                  />
                  <Text size="xsmall" className="text-ui-fg-subtle w-10">
                    {banner.is_active ? "Live" : "Off"}
                  </Text>
                </div>
                <Button size="small" variant="secondary" onClick={() => openEdit(banner)}>
                  Edit
                </Button>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() => remove(banner)}
                  aria-label={`Delete ${banner.name}`}
                >
                  ✕
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Site Banners",
  icon: Palette,
})

export default SiteBannersPage
