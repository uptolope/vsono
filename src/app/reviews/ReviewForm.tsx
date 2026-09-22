"use client";

import { FormEvent, useState } from "react";

export default function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          body,
          displayName: displayName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Unable to submit your review.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setBody("");
      setDisplayName("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#d8d0c5] bg-[#f8f5ef] p-6 shadow-sm"
    >
      <h2 className="mb-2 text-xl font-semibold text-[#24211e]">
        Share your experience
      </h2>

      <p className="mb-6 text-sm text-[#6e675f]">
        Reviews are checked before appearing publicly.
      </p>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-[#24211e]">
          Your rating
        </legend>

        <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className={`text-3xl transition ${
                value <= rating ? "text-[#c88935]" : "text-[#cfc7bb]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mb-2 block text-sm font-medium text-[#24211e]" htmlFor="review">
        Review
      </label>

      <textarea
        id="review"
        required
        minLength={20}
        maxLength={1000}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What helped you most?"
        className="mb-1 min-h-32 w-full border border-[#cfc7bb] bg-white p-3 text-sm text-[#24211e] outline-none focus:border-[#9b6a2c]"
      />

      <p className="mb-5 text-right text-xs text-[#857c72]">
        {body.length}/1,000
      </p>

      <label className="mb-2 block text-sm font-medium text-[#24211e]" htmlFor="displayName">
        Display name <span className="font-normal text-[#857c72]">(optional)</span>
      </label>

      <input
        id="displayName"
        maxLength={80}
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="e.g. Alex R."
        className="mb-5 w-full border border-[#cfc7bb] bg-white p-3 text-sm text-[#24211e] outline-none focus:border-[#9b6a2c]"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-[#24211e] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#403a34] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit review"}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            status === "error" ? "text-red-700" : "text-[#496947]"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
