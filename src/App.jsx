import { useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPaste, RotateCcw, Send } from "lucide-react";

const NS = "mockPartner.";

const DEFAULTS = {
  submitUrl: "https://localhost:3000/partner/binding",
  client_id: "3841",
  partner_token: "",
  state: "1234",
  code_challenge: "n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg",
  code_challenge_method: "S256",
  redirect_uri: "https://localhost:3000/callback",
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

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase text-muted-foreground/70 shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
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

export default function App() {
  const submitUrl = useField("submitUrl");
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

  async function handlePasteToken() {
    try {
      const text = await navigator.clipboard.readText();
      partnerToken.reset(text);
    } catch {
      // clipboard access denied — user can paste manually
    }
  }

  function handleReset() {
    submitUrl.reset(DEFAULTS.submitUrl);
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
    const form = e.currentTarget;
    form.action = submitUrl.value;
    form.submit();
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-start justify-center p-4 sm:p-8 sm:py-12">
      <Card className="w-full max-w-[520px] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.06)] border-border/60 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="warning" className="font-mono text-[10px] tracking-widest uppercase">
              DEV / QA ONLY
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2.5 font-mono text-[11px] gap-1.5 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div>
              <h2 className="font-semibold text-[17px] text-foreground leading-tight">Mock Partner Web</h2>
              <p className="text-[12px] text-muted-foreground font-sans mt-0.5">
                Simulates a partner webview POSTing to{" "}
                <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono">/partner/binding</code>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Submit URL */}
          <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 mb-5">
            <FieldRow id="submitUrl" label="Submit URL" required>
              <Textarea
                id="submitUrl"
                type="url"
                className="border-sky-300 focus-visible:ring-sky-400 bg-white font-mono text-[15px] h-12"
                {...submitUrl}
              />
            </FieldRow>
            
          </div>
          <Button type="submit" form="bindingForm" className="w-full h-11 font-semibold text-[14px] gap-2">
              <Send className="h-4 w-4" />
              Submit Binding Request
            </Button>

          <form id="bindingForm" method="POST" onSubmit={handleSubmit}>
            <SectionDivider label="Identity" />

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
                  Paste token
                </Button>
              }
            >
              <Textarea
                id="partner_token"
                name="partner_token"
                rows={3}
                placeholder="paste partner access_token"
                className="text-[12px]"
                {...partnerToken}
              />
            </FieldRow>

            <FieldRow id="client_id" label="client_id" required>
              <Input id="client_id" name="client_id" {...clientId} />
            </FieldRow>
            <FieldRow
              id="redirect_uri"
              label="redirect_uri"
              required
              hint="OAuth callback URI. Must match a pre-registered URI for the client_id."
            >
              <Input id="redirect_uri" name="redirect_uri" type="url" {...redirectUri} />
            </FieldRow>

            <FieldRow id="state" label="state" required>
              <Input id="state" name="state" {...state} />
            </FieldRow>

            <FieldRow id="code_challenge" label="code_challenge" required>
              <Input id="code_challenge" name="code_challenge" {...codeChallenge} />
            </FieldRow>

            <FieldRow id="code_challenge_method" label="code_challenge_method" required>
              <Input id="code_challenge_method" name="code_challenge_method" {...codeChallengeMethod} />
            </FieldRow>

            <SectionDivider label="Device" />

            <FieldRow id="device" label="device" required>
              <select
                id="device"
                name="device"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...device}
              >
                <option value="web">web</option>
                <option value="iphone">iphone</option>
                <option value="android">android</option>
              </select>
            </FieldRow>

            <FieldRow id="device_id" label="device_id" required>
              <Input id="device_id" name="device_id" {...deviceId} />
            </FieldRow>

            <FieldRow id="device_model" label="device_model" required>
              <Input id="device_model" name="device_model" {...deviceModel} />
            </FieldRow>

            <SectionDivider label="Optional" />

            <FieldRow id="latlong" label="latlong" required={false}>
              <Input
                id="latlong"
                name="latlong"
                pattern="-?\d+(\.\d+)?,-?\d+(\.\d+)?"
                placeholder="lat,long"
                {...latlong}
              />
            </FieldRow>

            <FieldRow id="lang" label="lang" required={false}>
              <Input id="lang" name="lang" {...lang} />
            </FieldRow>

            <FieldRow
              id="scope"
              label="scope"
              required={false}
              hint={
                <>
                  OAuth scope. Defaults to{" "}
                  <code className="text-[11px] bg-muted px-1 rounded font-mono">public_profile</code>.
                </>
              }
            >
              <Input id="scope" name="scope" {...scope} />
            </FieldRow>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
