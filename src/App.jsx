import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPaste, RotateCcw, Send, Link2, Lock } from "lucide-react";

const NS = "mockPartner.";

const BINDING_PATH = "/partner/binding";

const DEFAULTS = {
  host: "https://sdk-identity.trueid-preprod.net",
  client_id: "3841",
  partner_token: "",
  state: "1234",
  code_challenge: "n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg",
  code_challenge_method: "S256",
  redirect_uri: "http://fnwidget.trueid.net/",
  device: "iphone",
  device_id: "4C0D79DC-3D78-4735-9925-373D17731EBA",
  device_model: "iPhone14,5",
  latlong: "0.0,0.0",
  lang: "en",
  scope: "public_profile",
};

function load(key) {
  const v = localStorage.getItem(NS + key);
  return v !== null ? v : (DEFAULTS[key] ?? "");
}

function persist(key, value) {
  if (value === "") {
    localStorage.removeItem(NS + key);
  } else {
    localStorage.setItem(NS + key, value);
  }
}

function useField(name) {
  const [value, setValueRaw] = useState(() => load(name));
  const timer = useRef(null);

  const onChange = useCallback(
    (e) => {
      const val = e.target.value;
      setValueRaw(val);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => persist(name, val), 150);
    },
    [name],
  );

  const reset = useCallback(
    (val) => {
      setValueRaw(val);
      persist(name, val);
    },
    [name],
  );

  return { value, onChange, reset };
}

function FieldRow({ id, label, required, hint, action, children }) {
  return (
    <div className="mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-1.5">
        <Label htmlFor={id} className="font-mono text-[13px] text-foreground/90 flex items-center gap-1.5">
          {label}
          {required ? (
            <span className="text-destructive text-xs">*</span>
          ) : (
            <span className="text-muted-foreground/60 font-normal text-[11px] ml-1">optional</span>
          )}
        </Label>
        {action}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] text-muted-foreground leading-relaxed font-sans">{hint}</p>}
    </div>
  );
}

function ChannelHeader({ icon: Icon, tone, kind, title, subtitle }) {
  const tones = {
    amber: "bg-amber-100 text-amber-900 ring-amber-200",
    slate: "bg-slate-200 text-slate-700 ring-slate-300",
  };
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ring-1 ring-inset font-mono text-[10px] font-bold tracking-[0.08em] uppercase ${tones[tone]}`}
      >
        <Icon className="h-3 w-3" />
        {kind}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[12.5px] font-semibold text-foreground leading-tight">{title}</div>
        {subtitle && <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const host = useField("host");
  const clientId = useField("client_id");
  const partnerToken = useField("partner_token");
  const state = useField("state");
  const codeChallenge = useField("code_challenge");
  const codeChallengeMethod = useField("code_challenge_method");
  const redirectUri = useField("redirect_uri");
  const device = useField("device");
  const deviceId = useField("device_id");
  const deviceModel = useField("device_model");
  const latlong = useField("latlong");
  const lang = useField("lang");
  const scope = useField("scope");

  const oauthEntries = useMemo(
    () => ({
      client_id: clientId.value,
      redirect_uri: redirectUri.value,
      state: state.value,
      code_challenge: codeChallenge.value,
      code_challenge_method: codeChallengeMethod.value,
      device: device.value,
      device_model: deviceModel.value,
      device_id: deviceId.value,
      latlong: latlong.value,
      lang: lang.value,
      scope: scope.value,
    }),
    [
      clientId.value,
      redirectUri.value,
      state.value,
      codeChallenge.value,
      codeChallengeMethod.value,
      device.value,
      deviceModel.value,
      deviceId.value,
      latlong.value,
      lang.value,
      scope.value,
    ],
  );

  const preview = useMemo(() => {
    const base = `${host.value.replace(/\/+$/, "")}${BINDING_PATH}`;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(oauthEntries)) {
      if (v) params.set(k, v);
    }
    return { base, params: [...params.entries()] };
  }, [oauthEntries, host.value]);

  async function handlePasteToken() {
    try {
      const text = await navigator.clipboard.readText();
      partnerToken.reset(text);
    } catch {
      // clipboard access denied — user can paste manually
    }
  }

  function handleReset() {
    host.reset(DEFAULTS.host);
    clientId.reset(DEFAULTS.client_id);
    partnerToken.reset(DEFAULTS.partner_token);
    state.reset(DEFAULTS.state);
    codeChallenge.reset(DEFAULTS.code_challenge);
    codeChallengeMethod.reset(DEFAULTS.code_challenge_method);
    redirectUri.reset(DEFAULTS.redirect_uri);
    device.reset(DEFAULTS.device);
    deviceId.reset(DEFAULTS.device_id);
    deviceModel.reset(DEFAULTS.device_model);
    latlong.reset(DEFAULTS.latlong);
    lang.reset(DEFAULTS.lang);
    scope.reset(DEFAULTS.scope);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(oauthEntries)) {
      if (v) params.set(k, v);
    }

    const base = `${host.value.replace(/\/+$/, "")}${BINDING_PATH}`;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${base}?${params.toString()}`;

    const tokenInput = document.createElement("input");
    tokenInput.type = "hidden";
    tokenInput.name = "partner_token";
    tokenInput.value = partnerToken.value;
    form.appendChild(tokenInput);

    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-start justify-center p-2 sm:p-8 sm:py-12">
      <Card className="w-full max-w-[560px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] border-border/60 animate-fade-in">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-[15px] sm:text-[17px] text-foreground leading-tight">Mock Partner Web</h2>
              <p className="text-[11px] sm:text-[12px] text-muted-foreground font-sans mt-1 leading-relaxed">
                Simulates a partner webview. OAuth params travel as{" "}
                <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">?query</span>; only{" "}
                <span className="font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded">partner_token</span> goes in the POST body.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2.5 font-mono text-[11px] gap-1.5 shrink-0 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
          <form id="bindingForm" method="POST" onSubmit={handleSubmit}>
            {/* POST Body — partner_token only */}
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-3.5 mb-5">
              <ChannelHeader
                icon={Lock}
                tone="amber"
                kind="POST Body"
                title="partner_token"
                subtitle="form-encoded · the only body field"
              />
              <FieldRow
                id="partner_token"
                label="partner_token"
                required
                hint="Bearer access_token. Server verifies it upstream against partner user-info."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePasteToken}
                    className="h-6 px-2 text-[10px] font-mono gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardPaste className="h-3 w-3" />
                    Paste
                  </Button>
                }
              >
                <Textarea
                  id="partner_token"
                  name="partner_token"
                  rows={3}
                  placeholder="paste partner access_token"
                  className="text-[12px] bg-white"
                  {...partnerToken}
                />
              </FieldRow>
            </div>

            {/* Host + Resolved URL + Submit */}
            <div className="rounded-lg bg-sky-50 border border-sky-200 p-3.5 mb-5">
              <FieldRow id="host" label="Host" required>
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  <Input
                    id="host"
                    type="url"
                    placeholder="https://localhost:3000"
                    className="w-full sm:flex-1 rounded-b-none sm:rounded-b-md sm:rounded-r-none border-b-0 sm:border-b sm:border-r-0 border-sky-300 focus-visible:ring-sky-400 bg-white font-mono text-[14px]"
                    {...host}
                  />
                  <div className="shrink-0 flex items-center justify-start px-3 py-1.5 sm:py-0 rounded-b-md sm:rounded-b-md sm:rounded-l-none border border-sky-300 bg-sky-100/80 font-mono text-[12px] sm:text-[13px] text-sky-900/80 select-none">
                    {BINDING_PATH}
                  </div>
                </div>
              </FieldRow>

              <div className="mt-3 pt-3 border-t border-sky-200/70">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-[0.1em] uppercase text-sky-700/80">
                    Resolved request
                  </span>
                  <div className="h-px flex-1 bg-sky-200/60" />
                </div>
                <div className="rounded-md bg-white border border-sky-200 px-3 py-2.5 font-mono text-[12.5px] leading-[1.7] break-all">
                  <span className="inline-flex items-center rounded bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200 px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide mr-2 align-middle">
                    POST
                  </span>
                  <span className="text-slate-900 font-medium">{preview.base}</span>
                  {preview.params.length > 0 && (
                    <>
                      <span className="text-sky-600 font-bold">?</span>
                      {preview.params.map(([k, v], i) => (
                        <span key={k}>
                          {i > 0 && <span className="text-sky-500/70 font-bold">&</span>}
                          <span className="text-slate-700">{k}</span>
                          <span className="text-slate-400">=</span>
                          <span className="text-slate-500">{v}</span>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-semibold text-[14px] gap-2 mt-4">
                <Send className="h-4 w-4" />
                Submit Binding Request
              </Button>
            </div>

            {/* Query String — OAuth params */}
            <div className="rounded-lg border-2 border-slate-200 bg-slate-50/60 p-3.5">
              <ChannelHeader
                icon={Link2}
                tone="slate"
                kind="Query String"
                title="OAuth parameters"
                subtitle="appended to the endpoint URL as ?key=value"
              />

              <FieldRow id="client_id" label="client_id" required>
                <Input id="client_id" name="client_id" className="bg-white" {...clientId} />
              </FieldRow>

              <FieldRow id="redirect_uri" label="redirect_uri" required>
                <Input id="redirect_uri" name="redirect_uri" type="url" className="bg-white" {...redirectUri} />
              </FieldRow>

              <FieldRow id="state" label="state" required>
                <Input id="state" name="state" className="bg-white" {...state} />
              </FieldRow>

              <FieldRow id="code_challenge" label="code_challenge" required>
                <Input id="code_challenge" name="code_challenge" className="bg-white" {...codeChallenge} />
              </FieldRow>

              <FieldRow id="code_challenge_method" label="code_challenge_method" required>
                <Input id="code_challenge_method" name="code_challenge_method" className="bg-white" {...codeChallengeMethod} />
              </FieldRow>

              <FieldRow id="device" label="device" required>
                <select
                  id="device"
                  name="device"
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...device}
                >
                  <option value="web">web</option>
                  <option value="iphone">iphone</option>
                  <option value="android">android</option>
                </select>
              </FieldRow>

              <FieldRow id="device_model" label="device_model" required>
                <Input id="device_model" name="device_model" className="bg-white" {...deviceModel} />
              </FieldRow>

              <FieldRow id="device_id" label="device_id" required>
                <Input id="device_id" name="device_id" className="bg-white" {...deviceId} />
              </FieldRow>

              <div className="flex items-center gap-3 mt-5 mb-3">
                <span className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase text-slate-500 shrink-0">
                  Optional
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <FieldRow id="latlong" label="latlong" required={false}>
                <Input
                  id="latlong"
                  name="latlong"
                  pattern="-?\d+(\.\d+)?,-?\d+(\.\d+)?"
                  placeholder="lat,long"
                  className="bg-white"
                  {...latlong}
                />
              </FieldRow>

              <FieldRow id="lang" label="lang" required={false}>
                <Input id="lang" name="lang" className="bg-white" {...lang} />
              </FieldRow>

              <FieldRow id="scope" label="scope" required={false}>
                <Input id="scope" name="scope" className="bg-white" {...scope} />
              </FieldRow>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
