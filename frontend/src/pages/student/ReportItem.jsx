import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ImagePlus,
  Loader2,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { categoriesApi, itemsApi } from "@/lib/api";
import { StepProgress } from "@/components/ui/step-progress";
import { Button } from "@/components/ui/button";
// FIXED IMPORTS: Separated so React can find them
import { Input, FieldError } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this file
import { Label } from "@/components/ui/label"; // Assuming you have this file
import { Select } from "@/components/ui/select";
import { ItemTypeBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STEPS = ["Details", "Category", "Photo & Review"];

const INITIAL_FORM = {
  type: "LOST",
  title: "",
  description: "",
  categoryId: "",
  location: "",
  imageFile: null,
  imagePreview: null,
};

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export default function ReportItemPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  function updateForm(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function validateStep(currentStep) {
    const next = {};
    if (currentStep === 1) {
      if (!form.title.trim()) next.title = "Give the item a short title.";
      if (!form.description.trim())
        next.description = "A quick description helps others recognize it.";
    }
    if (currentStep === 2) {
      if (!form.categoryId) next.categoryId = "Pick the closest category.";
      if (!form.location.trim()) next.location = "Where was it lost or found?";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateForm({ imageFile: file, imagePreview: URL.createObjectURL(file) });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await itemsApi.reportItem({
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        categoryId: Number(form.categoryId),
        imageUrl: form.imagePreview || null,
      });
      setDone(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          "Couldn't submit this report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-tint text-moss"
        >
          <Check className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-5 font-display text-2xl text-ink">
          Logged in the ledger
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          Your {form.type === "LOST" ? "lost" : "found"} item report is live.
          We'll notify you if there's a match.
        </p>
        <div className="mt-8 flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
          >
            Back to feed
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setForm(INITIAL_FORM);
              setStep(1);
              setDone(false);
            }}
          >
            Report another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-6 sm:px-6 sm:pb-16">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">
          New intake
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink">
          Report an item
        </h1>
      </header>

      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={step} />
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div>
                <Label>What happened?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["LOST", "FOUND"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateForm({ type: t })}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors",
                        form.type === t
                          ? "border-ink bg-ink text-paper"
                          : "border-stone bg-white text-ink/60",
                      )}
                    >
                      <ItemTypeBadge
                        type={t}
                        className={
                          form.type === t
                            ? "bg-white/15 text-current border-current/30"
                            : ""
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Item title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Black leather wallet"
                  value={form.title}
                  error={errors.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                />
                {errors.title && <FieldError>{errors.title}</FieldError>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Color, brand, distinguishing marks, contents…"
                  value={form.description}
                  error={errors.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
                {errors.description && (
                  <FieldError>{errors.description}</FieldError>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={form.categoryId}
                  error={errors.categoryId}
                  onChange={(e) => updateForm({ categoryId: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FieldError>{errors.categoryId}</FieldError>
                )}
              </div>

              <div>
                <Label htmlFor="location">
                  {form.type === "LOST"
                    ? "Last seen location"
                    : "Found location"}
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Main Library, 2nd floor"
                  value={form.location}
                  error={errors.location}
                  onChange={(e) => updateForm({ location: e.target.value })}
                />
                {errors.location && <FieldError>{errors.location}</FieldError>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              <div>
                <Label>Photo (optional)</Label>
                {form.imagePreview ? (
                  <div className="relative overflow-hidden rounded-card border border-stone">
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateForm({ imageFile: null, imagePreview: null })
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed border-stone bg-white text-ink/45">
                    <div className="flex gap-3">
                      <Camera className="h-6 w-6" />
                      <ImagePlus className="h-6 w-6" />
                    </div>
                    <span className="text-sm">Tap to add a photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <div className="rounded-card border border-stone bg-white p-4">
                <p className="font-mono text-[11px] uppercase tracking-wide text-ink/40">
                  Review
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Type</dt>
                    <dd>
                      <ItemTypeBadge type={form.type} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Title</dt>
                    <dd className="text-right font-medium text-ink">
                      {form.title || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Category</dt>
                    <dd className="text-right text-ink">
                      {categories.find(
                        (c) => String(c.id) === String(form.categoryId),
                      )?.name || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink/50">Location</dt>
                    <dd className="text-right text-ink">
                      {form.location || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {submitError && (
                <div className="rounded-xl border border-clay/30 bg-clay-tint p-3 text-sm text-clay">
                  {submitError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button variant="outline" onClick={goBack} className="flex-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {step < STEPS.length ? (
          <Button onClick={goNext} className="flex-1">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {submitting ? "Submitting…" : "Submit report"}
          </Button>
        )}
      </div>
    </div>
  );
}
