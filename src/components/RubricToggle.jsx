import { useState } from 'react';
import apiFetch from '../api/client';

export default function RubricToggle({ assignmentId }) {
  const [open, setOpen] = useState(false);
  const [rubric, setRubric] = useState('');

  async function toggle() {
    if (!open && !rubric) {
      const res = await apiFetch(`/assignments/${assignmentId}/rubric`);
      setRubric(res.rubric || 'No rubric provided.');
    }
    setOpen(!open);
  }

  return (
    <div className="mt-3">
      <button className="btn" onClick={toggle}>
        {open ? 'Hide Rubric' : 'View Rubric'}
      </button>

      {open && (
        <div className="mt-2 p-3 border rounded bg-white whitespace-pre-wrap">
          {rubric}
        </div>
      )}
    </div>
  );
}
