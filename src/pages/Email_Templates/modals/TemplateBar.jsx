import React from 'react'

const TemplateBar = ({ template, onEdit, onDelete, onSend }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.type}</h3>
                <p className="text-sm text-gray-500">
                    {template.subject ?? ''}
                </p>

            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onSend} 
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md"
                >
                    📤
                </button>
                <button
                    onClick={onEdit}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                    title="Edit Category"
                >
                    ✏️
                </button>
                <button
                    onClick={onDelete}
                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                    title="Delete Category"
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

export default TemplateBar
