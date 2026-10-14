import { useState } from "react";
import Avatar from "./Avatar";
import Field from "./Field";
import { FACULTY_FIELDS } from "../data";

export default function Profile({ me, onSave, toast }) {
  const [bio, setBio] = useState(me.bio || "");
  const [field, setField] = useState(me.field || "");
  const [batch, setBatch] = useState(me.batch || "");
  const [currentPosition, setCurrentPosition] = useState(
    me.currentPosition || "",
  );

  return (
    <>
      <div className="overflow-hidden rounded-[18px] border border-ln bg-sf !p-0 shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
        <div className="h-[110px] bg-[linear-gradient(135deg,var(--pri),var(--pri2))]" />
        <div className="p-[18px]">
          <div className="flex flex-wrap items-center gap-2.5 -mt-[46px]">
            <Avatar name={me.name} />
            <div>
              <h2>{me.name}</h2>
              <span className="inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold text-pri">{me.role}</span>
            </div>
          </div>
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] mt-3">
            {me.role !== "admin" && (
              <div>
                <span className="text-[13px] text-mut">University</span>
                <p>
                  <b>{me.uni}</b>
                </p>
              </div>
            )}
            <div>
              <span className="text-[13px] text-mut">Email</span>
              <p>
                <b>{me.email}</b>
              </p>
            </div>
            {me.role === "alumni" && (
              <>
                <div>
                  <span className="text-[13px] text-mut">Graduation batch</span>
                  <p>
                    <b>{me.batch}</b>
                  </p>
                </div>
                <div>
                  <span className="text-[13px] text-mut">Current workplace / position</span>
                  <p>
                    <b>{me.currentPosition}</b>
                  </p>
                </div>
              </>
            )}
            {me.role === "student" && (
              <div>
                <span className="text-[13px] text-mut">Interested field</span>
                <p>
                  <b>{me.field}</b>
                </p>
              </div>
            )}
          </div>
          {me.role !== "admin" && (
            <>
              <span className="text-[13px] text-mut">Bio</span>
              <p>{me.bio}</p>
            </>
          )}
        </div>
      </div>
      <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
        <h3>Edit profile</h3>
        {me.role === "alumni" && (
          <>
            <Field
              id="ebatch"
              label="Graduation batch"
              value={batch}
              onChange={setBatch}
            />
            <Field
              id="eposition"
              label="Current workplace / position"
              value={currentPosition}
              onChange={setCurrentPosition}
            />
          </>
        )}
        {me.role === "student" && (
          <>
            <label htmlFor="efield">Interested field</label>
            <select
              id="efield"
              value={field}
              onChange={(e) => setField(e.target.value)}
              disabled={!me.faculty}
            >
              <option value="">Choose a field</option>
              {(FACULTY_FIELDS[me.faculty] || []).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </>
        )}
        {me.role !== "admin" && (
          <>
            <label htmlFor="eb">Bio</label>
            <textarea
              id="eb"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </>
        )}
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 mt-3"
          onClick={() => {
            onSave(
              me.role === "admin"
                ? {}
                : me.role === "alumni"
                  ? { bio, batch, currentPosition }
                  : { bio, field },
            );
            toast("Profile saved");
          }}
        >
          Save changes
        </button>
      </div>
    </>
  );
}
