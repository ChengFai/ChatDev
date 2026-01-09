import yaml from 'js-yaml'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiUrl = (path: string) => `${API_BASE_URL}${path}`

const addYamlSuffix = (filename: string) => {
  const trimmed = (filename || '').trim()
  if (!trimmed) {
    return ''
  }
  if (trimmed.endsWith('.yaml') || trimmed.endsWith('.yml')) {
    return trimmed
  }
  return `${trimmed}.yaml`
}

// Upload a YAML file
export async function postYaml(filename: string, content: string) {
  try {
    const fullFilename = addYamlSuffix(filename)
    const response = await fetch(apiUrl('/api/workflows/upload/content'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: fullFilename,
        content: content
      })
    })

    if (response.ok || response.status === 400) {
      const data = await response.json()

      if (data.status) {
        return {
          success: true,
          message: 'YAML file saved successfully!'
        }
      } else if (data.detail) {
        return {
          success: false,
          detail: data.detail
        }
      } else {
        return {
          success: false,
          message: 'Unknown error saving YAML file'
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error saving YAML file:', errorData)
      return {
        success: false,
        message: `Error saving YAML file: ${errorData.message || response.statusText}`
      }
    }
  } catch (error) {
    console.error('Error saving YAML file:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

export async function updateYaml(filename: string, content: string) {
  try {
    const yamlFilename = addYamlSuffix(filename)
    const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(yamlFilename)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        filename: data?.filename || yamlFilename,
        message: data?.message || 'Workflow updated successfully'
      }
    }

    return {
      success: false,
      detail: data?.detail,
      message: data.error?.message || 'Failed to update workflow',
      status: response.status
    }
  } catch (error) {
    console.error('Error updating workflow YAML:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

// Rename YAML file
export async function postYamlNameChange(filename: string, newFilename: string) {
  try {
    const yamlFilename = addYamlSuffix(filename)
    const yamlNewFilename = addYamlSuffix(newFilename)
    const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(yamlFilename)}/rename`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_filename: yamlNewFilename
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        filename: data?.filename || yamlNewFilename,
        message: data?.message || 'Workflow renamed successfully'
      }
    }

    return {
      success: false,
      detail: data?.detail,
      message: data?.message || 'Failed to rename workflow',
      status: response.status
    }
  } catch (error) {
    console.error('Error renaming workflow YAML:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

// Copy YAML file
export async function postYamlCopy(filename: string, newFilename: string) {
  try {
    const yamlFilename = addYamlSuffix(filename)
    const yamlNewFilename = addYamlSuffix(newFilename)
    const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(yamlFilename)}/copy`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_filename: yamlNewFilename
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        filename: data?.filename || yamlNewFilename,
        message: data?.message || 'Workflow copied successfully'
      }
    }

    return {
      success: false,
      detail: data?.detail,
      message: data?.message || 'Failed to copy workflow',
      status: response.status
    }
  } catch (error) {
    console.error('Error copying workflow YAML:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

interface Workflow {
  name: string
  description: string
}

// Load the YAML file list from the API with names and descriptions
export async function fetchWorkflowsWithDesc(): Promise<{ success: boolean; workflows?: Workflow[]; error?: string }> {
  try {
    const response = await fetch(apiUrl('/api/workflows'))
    if (!response.ok) {
      throw new Error(`/api/workflows fetch error, status: ${response.status}`)
    }
    const data = await response.json()

    const filesWithDesc = await Promise.all(
      data.workflows.map(async (filename: string) => {
        try {
          const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(filename)}`))
          const fileData = await response.json()
          return {
            name: filename,
            description: getYAMLDescription(fileData.content)
          }
        } catch {
          return { name: filename, description: 'No description' }
        }
      })
    )

    return {
      success: true,
      workflows: filesWithDesc
    }
  } catch (err) {
    console.error('Failed to load YAML files:', err)
    return {
      success: false,
      error: 'Failure loading YAML files, please run API service'
    }
  }

  function getYAMLDescription(content: string) {
    try {
      const doc = yaml.load(content) as any
      return doc.graph.description || 'No description'
    } catch {
      return 'No description'
    }
  }
}

// Fetch YAML file content
export async function fetchWorkflowYAML(filename: string): Promise<string> {
  try {
    const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(filename)}`))
    if (!response.ok) {
      throw new Error(`Failed to load YAML file: ${filename}, status: ${response.status}`)
    }
    const data = await response.json()
    return data.content
  } catch (err) {
    console.error('Failed to load YAML file:', err)
    throw err
  }
}

// Fetch YAML for the specified workflow
export async function fetchYaml(filename: string) {
  try {
    const yamlFilename = addYamlSuffix(filename)
    const response = await fetch(apiUrl(`/api/workflows/${encodeURIComponent(yamlFilename)}`))

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        content: data?.content
      }
    }

    return {
      success: false,
      detail: data?.detail,
      message: data?.message || 'Failed to fetch YAML file',
      status: response.status
    }
  } catch (error) {
    console.error('Error fetching YAML file:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

// Fetch the ReactFlow graph
export async function fetchReactGraph(key: string) {
  try {
    const response = await fetch(apiUrl(`/api/vuegraphs/${encodeURIComponent(key)}`))
    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        content: data?.content,
        status: response.status
      }
    }

    return {
      success: false,
      status: response.status,
      detail: data?.detail,
      message: data?.message || 'Failed to fetch ReactFlow graph'
    }
  } catch (error) {
    console.error('Error fetching ReactFlow graph:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

// Save the ReactFlow graph
export async function postReactGraphs({ filename, content }: { filename: string; content: any }) {
  try {
    const response = await fetch(apiUrl('/api/vuegraphs/upload/content'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        message: data?.message || 'ReactFlow graph saved successfully'
      }
    }

    return {
      success: false,
      status: response.status,
      detail: data?.detail,
      message: data?.message || 'Failed to save ReactFlow graph'
    }
  } catch (error) {
    console.error('Error saving ReactFlow graph:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}

// Fetch the config schema
export async function fetchConfigSchema(breadcrumbs: string[]) {
  try {
    const response = await fetch(apiUrl('/api/config/schema'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        breadcrumbs: breadcrumbs
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch config schema: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch config schema:', error)
    throw error
  }
}

// Download execution logs
export async function fetchLogsZip(sessionId: string) {
  try {
    const response = await fetch(apiUrl(`/api/sessions/${encodeURIComponent(sessionId)}/download`))

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `execution_logs_${sessionId}.zip`
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Failed to download execution logs:', error)
    throw error
  }
}

// Fetch session attachments
export async function getAttachment(sessionId: string, attachmentId: string) {
  try {
    if (!sessionId) {
      throw new Error('Missing session id')
    }
    if (!attachmentId) {
      throw new Error('Missing attachment id')
    }

    const response = await fetch(apiUrl(`/api/sessions/${encodeURIComponent(sessionId)}/artifacts/${encodeURIComponent(attachmentId)}`))

    if (!response.ok) {
      throw new Error(`Failed to fetch attachment: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data?.data_uri
  } catch (error) {
    console.error('Failed to fetch attachment:', error)
    throw error
  }
}

// Upload a binary file
export async function postFile(sessionId: string, file: File | Blob | string) {
  try {
    if (!sessionId) {
      throw new Error('Missing session id')
    }

    if (!file) {
      throw new Error('Missing file payload')
    }

    const formData = new FormData()
    let payload: Blob
    let filename = 'upload.bin'

    if (typeof file === 'string') {
      payload = new Blob([file], { type: 'application/octet-stream' })
    } else if (file instanceof File) {
      payload = file
      filename = file.name
    } else {
      payload = file
    }

    formData.append('file', payload, filename)

    const response = await fetch(apiUrl(`/api/uploads/${encodeURIComponent(sessionId)}`), {
      method: 'POST',
      body: formData
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      return {
        success: true,
        message: 'File uploaded successfully',
        name: data?.name,
        attachmentId: data?.attachment_id,
        mimeType: data?.mime_type,
        size: data?.size
      }
    }

    return {
      success: false,
      message: 'Failed to upload file'
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      message: 'API error'
    }
  }
}
