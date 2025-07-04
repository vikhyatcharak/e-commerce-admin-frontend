import React, { useEffect, useState } from 'react'
import { emailTemplatesAPI } from '../../api/admin.js'
import CreateTemplateModal from './modals/CreateTemplateModal.jsx'
import EditTemplateModal from './modals/EditTemplateModal.jsx'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.jsx'
import TemplateBar from './modals/TemplateBar.jsx'
import SendEmailModal from './modals/SendEmailModal.jsx'


const EmailTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)


  const [totalTemplates, setTotalTemplates] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const TemplatesPerPage = 5
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('created_at-desc')
  const [searchInput, setSearchInput] = useState('')


  useEffect(() => {
    fetchTemplates()
  }, [sortOption, currentPage, searchQuery])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const filters = {
        page: currentPage,
        limit: TemplatesPerPage,
        search: searchQuery,
        sortBy: sortOption.split('-')[0],
        sortOrder: sortOption.split('-')[1].toUpperCase(),
      }
      const response = await emailTemplatesAPI.getPaginatedTemplates(filters)
      if (response.data?.success) {
        const { data, total } = response.data?.data
        setTemplates(data)
        setTotalTemplates(total)
      }
    } catch (err) {
      console.error('Error fetching Templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalTemplates / TemplatesPerPage)


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email-Templates Management</h1>
          <p className="text-gray-600 mt-1">View, create, edit, or delete email-templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          ➕ Add Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎟️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Create your first template</p>
          </div>
        ) : (
          <>
            {/* Filter/Search/Sort */}
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex gap-1 w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  className="border px-3 py-2 rounded-md w-full sm:w-auto flex-1"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1)
                      setSearchQuery(searchInput)
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setCurrentPage(1)
                    setSearchQuery(searchInput)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                >
                  🔍
                </button>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border px-3 py-2 rounded-md"
              >
                <option value="type-asc">Type A-Z</option>
                <option value="type-desc">Type Z-A</option>
                <option value="created_at-desc">Newest</option>
                <option value="created_at-asc">Oldest</option>
              </select>
            </div>

            {/* Template Bars */}
            {templates.map(template => (
              <TemplateBar
                key={template.id}
                template={template}
                onEdit={() => {
                  setSelectedTemplate(template)
                  setShowEditModal(true)
                }}
                onDelete={() => {
                  setSelectedTemplate(template)
                  setShowDeleteModal(true)
                }}
                onSend={() => {
                  setSelectedTemplate(template)
                  setShowSendModal(true)
                }}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-4 py-2 border rounded ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : ''}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={fetchTemplates}
      />

      <EditTemplateModal
        isOpen={showEditModal}
        template={selectedTemplate}
        onClose={() => {
          setShowEditModal(false)
          setSelectedTemplate(null)
        }}
        onSubmit={fetchTemplates}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete template"
        message={`Are you sure you want to delete template "${selectedTemplate?.type}"?`}
        onConfirm={async () => {
          await emailTemplatesAPI.deleteTemplate(selectedTemplate.id)
          fetchTemplates()
          setShowDeleteModal(false)
          setSelectedTemplate(null)
        }}
        onCancel={() => {
          setShowDeleteModal(false)
          setSelectedTemplate(null)
        }}
      />
      <SendEmailModal
        isOpen={showSendModal}
        template={selectedTemplate}
        onClose={() => {
          setShowSendModal(false)
          setSelectedTemplate(null)
        }}
        onSubmit={fetchTemplates}
      />
    </div>
  )
}

export default EmailTemplates