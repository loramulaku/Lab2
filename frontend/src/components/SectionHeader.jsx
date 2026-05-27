import Button from './Button';

export default function SectionHeader({ title, onAdd, addLabel = '+ Add', action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {onAdd && (
        <Button onClick={onAdd} size="sm">
          {addLabel}
        </Button>
      )}
      {action}
    </div>
  );
}
