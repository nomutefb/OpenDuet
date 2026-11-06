// 단톡방 그림 = 픽토그램 선만(형 11-06 20:15 「팀즈 색으로 단톡방이 구현되어버렸는데, 전경색 투명한거에, 50% 투명도 시그니처색 라인만 픽토그램에 들어가게 단톡방 구현되게해줘」)
//   바탕 = 투명(옅은 테 하나) · 선 = 시그니처색(look.fg · 없으면 라임) 50% · 아이콘 = look.icon(번개 서버 roomlook · 형만 고름) · 없으면 방마다 기본
//   아이콘 묶음 = Lucide(morphicons 가 그대로 받는 이름 · 형 「이슈메이커는 이 아이콘이, morphicon에 있을거야」) · 고르는 판 50개와 같은 목록만 실음(묶음 통째 0)
import type { CSSProperties } from "react";
import { Activity, Anchor, Bell, Brush, Bug, Camera, Car, Cloud, Code, Coffee, Compass, Cpu, Crown, Database, Droplet, Film, Flame, FlaskConical, Flower2, GitBranch, Globe, Heart, Key, LayoutDashboard, Leaf, Lightbulb, Lock, Map, Megaphone, MessageCircle, Monitor, Moon, Music, Newspaper, Palette, PenTool, Pizza, Plane, Rocket, Server, Shield, Smile, Snowflake, Sparkles, Sprout, Star, Sun, Terminal, TrendingUp, Trophy, Users, Utensils, Wrench, Zap, type LucideIcon } from "lucide-react";

export const GLYPHS: Record<string, LucideIcon> = {
  "trending-up": TrendingUp, activity: Activity, rocket: Rocket, flame: Flame, zap: Zap, star: Star, sparkles: Sparkles, heart: Heart, crown: Crown, trophy: Trophy,
  megaphone: Megaphone, newspaper: Newspaper, camera: Camera, film: Film, music: Music, palette: Palette, brush: Brush, "pen-tool": PenTool, lightbulb: Lightbulb, "flask-conical": FlaskConical,
  code: Code, terminal: Terminal, cpu: Cpu, server: Server, database: Database, "git-branch": GitBranch, bug: Bug, shield: Shield, lock: Lock, key: Key,
  globe: Globe, map: Map, compass: Compass, anchor: Anchor, plane: Plane, car: Car, coffee: Coffee, pizza: Pizza, leaf: Leaf, sprout: Sprout,
  "flower-2": Flower2, sun: Sun, moon: Moon, cloud: Cloud, snowflake: Snowflake, droplet: Droplet, bell: Bell, "message-circle": MessageCircle, users: Users, smile: Smile,
  utensils: Utensils, wrench: Wrench, "layout-dashboard": LayoutDashboard, monitor: Monitor,
};
/** 방마다 기본(형이 안 골랐을 때) */
const DEFAULT_ICON: Record<string, string> = { all: "users", summary: "newspaper", ideation: "lightbulb", issue: "trending-up", repair: "wrench", memo: "pen-tool", guide: "utensils" };
export type RoomLook = { icon?: string; fg?: string };

/** 선색 = look.fg 첫 색(그라데이션이면 두 색) · 없으면 라임 */
const lineOf = (fg?: string) => { const c = String(fg || "").split(",").map((x) => x.trim()).filter((x) => /^#[0-9a-f]{6}$/i.test(x)); return c.length ? c : ["#CFFF40"]; };

export function RoomGlyph({ id, look, size = 40 }: { id: string; look?: RoomLook | null; size?: number }) {
  const name = look?.icon && GLYPHS[look.icon] ? look.icon : DEFAULT_ICON[id] || (id.startsWith("tmp-") ? "message-circle" : "users");
  const Icon = GLYPHS[name] || Users, cols = lineOf(look?.fg), gid = `rg-${id.replace(/[^a-z0-9]/gi, "")}`;
  const stroke = cols.length > 1 ? `url(#${gid})` : cols[0];
  return (
    <span className="nm-rglyph" style={{ width: size, height: size } as CSSProperties} aria-hidden>
      <svg width="0" height="0" style={{ position: "absolute" }}>{cols.length > 1 ? <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={cols[0]} /><stop offset="1" stopColor={cols[1]} /></linearGradient></defs> : null}</svg>
      <Icon size={Math.round(size * 0.5)} stroke={stroke} strokeWidth={2} style={{ opacity: 0.5 }} />
    </span>
  );
}
