import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { 
    Save, Play, ArrowLeft, Plus, Trash2, Sliders, Settings, 
    Database, Mail, Calendar, PlayCircle, Zap, Code, ShieldAlert,
    HelpCircle, ZoomIn, ZoomOut, Maximize2, Trash, X, ArrowRight, CheckCircle, Info,
    ChevronLeft, ChevronRight, GitBranch
} from 'lucide-react';
import axios from 'axios';

// Built-in component categories & types
const BUILT_IN_CATEGORIES = {
    trigger: {
        label: 'Triggers',
        color: 'text-amber-500 bg-amber-50 border-amber-200',
        borderColor: 'border-amber-400',
        accentColor: '#f59e0b',
        nodes: [
            {
                type: 'webhook_trigger',
                name: 'Webhook Trigger',
                description: 'Triggers workflow when a URL is requested',
                category: 'trigger',
                icon: Zap,
                fields: [
                    { name: 'webhookUrl', label: 'Webhook URL', type: 'text', defaultValue: 'https://kreatifcms.test/api/v1/webhooks/trigger-123', readonly: true },
                    { name: 'method', label: 'HTTP Method', type: 'select', defaultValue: 'POST', options: ['GET', 'POST', 'PUT'] }
                ]
            },
            {
                type: 'schedule_trigger',
                name: 'Schedule / Cron',
                description: 'Triggers workflow at scheduled intervals',
                category: 'trigger',
                icon: Calendar,
                fields: [
                    { name: 'cronExpression', label: 'Cron Expression', type: 'text', defaultValue: '*/5 * * * *', placeholder: 'e.g. */5 * * * *' },
                    { name: 'timezone', label: 'Timezone', type: 'select', defaultValue: 'UTC', options: ['UTC', 'Asia/Jakarta', 'America/New_York'] }
                ]
            }
        ]
    },
    action: {
        label: 'Actions',
        color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
        borderColor: 'border-indigo-400',
        accentColor: '#6366f1',
        nodes: [
            {
                type: 'send_email',
                name: 'Send Email',
                description: 'Sends an email notification',
                category: 'action',
                icon: Mail,
                fields: [
                    { name: 'to', label: 'To Email Address', type: 'text', placeholder: 'user@example.com' },
                    { name: 'subject', label: 'Subject', type: 'text', defaultValue: 'Workflow Alert' },
                    { name: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Enter email content here...' }
                ]
            },
            {
                type: 'webhook_request',
                name: 'Webhook Request',
                description: 'Sends an HTTP request to another server',
                category: 'action',
                icon: Code,
                fields: [
                    { name: 'url', label: 'Target URL', type: 'text', placeholder: 'https://api.thirdparty.com/v1/data' },
                    { name: 'method', label: 'HTTP Method', type: 'select', defaultValue: 'POST', options: ['GET', 'POST', 'PUT', 'DELETE'] },
                    { name: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Content-Type": "application/json"}' },
                    { name: 'payload', label: 'Payload Body (JSON)', type: 'textarea', placeholder: '{"status": "ok"}' }
                ]
            },
            {
                type: 'database_log',
                name: 'Database Log',
                description: 'Logs message or event to DB',
                category: 'action',
                icon: Database,
                fields: [
                    { name: 'logLevel', label: 'Log Level', type: 'select', defaultValue: 'info', options: ['info', 'warning', 'error'] },
                    { name: 'message', label: 'Message Text', type: 'textarea', placeholder: 'Enter log details...' }
                ]
            },
            {
                type: 'generate_number',
                name: 'Generate Doc Number',
                description: 'Generates dynamic document sequence number using DocNumberingService or node parameter sequence',
                category: 'action',
                icon: Database,
                fields: [
                    { name: 'numbering_mode', label: 'Numbering Mode', type: 'select', defaultValue: 'global_service', options: ['global_service', 'node_sequence'] },
                    { name: 'prefix', label: 'Prefix (for Node Sequence)', type: 'text', placeholder: 'e.g. JV/NODE/' },
                    { name: 'current_sequence', label: 'Current Sequence (for Node Sequence)', type: 'text', defaultValue: '1', placeholder: 'e.g. 1' },
                    { name: 'doc_type', label: 'Doc Type Slug (for Global Service)', type: 'text', placeholder: 'e.g. accounting_journals' },
                    { name: 'table', label: 'Database Table Name', type: 'text', placeholder: 'e.g. cms_accounting_journals' },
                    { name: 'number_field', label: 'Number Column Field', type: 'text', defaultValue: 'entry_number', placeholder: 'entry_number' }
                ]
            },
            {
                type: 'update_status',
                name: 'Update Record Status',
                description: 'Updates status or other field value on the record',
                category: 'action',
                icon: Sliders,
                fields: [
                    { name: 'table', label: 'Database Table Name', type: 'text', placeholder: 'e.g. cms_accounting_journals' },
                    { name: 'status_field', label: 'Status Column Field', type: 'text', defaultValue: 'status', placeholder: 'status' },
                    { name: 'status_value', label: 'Status Value to Set (Default)', type: 'text', defaultValue: 'posted', placeholder: 'posted' },
                    { name: 'role_based', label: 'Status based on executing User Role', type: 'switch', defaultValue: false },
                    { name: 'role_mappings', label: 'Role Status Mappings (JSON)', type: 'textarea', placeholder: '{"admin": "posted", "editor": "approved"}', defaultValue: '{"admin": "posted", "editor": "approved"}' }
                ]
            }
        ]
    },
    logic: {
        label: 'Logic / Flow',
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
        borderColor: 'border-emerald-400',
        accentColor: '#10b981',
        nodes: [
            {
                type: 'conditional_branch',
                name: 'If Conditional',
                description: 'Branches workflow depending on logic criteria',
                category: 'logic',
                icon: ShieldAlert,
                fields: [
                    { name: 'propertyName', label: 'Property to Check', type: 'text', placeholder: 'e.g. data.status' },
                    { name: 'operator', label: 'Operator', type: 'select', defaultValue: 'equals', options: ['equals', 'contains', 'greater_than', 'is_empty'] },
                    { name: 'value', label: 'Compare Value', type: 'text', placeholder: 'e.g. success' }
                ]
            },
            {
                type: 'check_user_role',
                name: 'Check User Roles',
                description: 'Verifies user authentication roles and permission scopes',
                category: 'logic',
                icon: ShieldAlert,
                fields: [
                    { name: 'required_roles', label: 'Required Roles (comma separated)', type: 'text', placeholder: 'admin, editor' },
                    { name: 'required_permissions', label: 'Required Permissions (comma separated)', type: 'text', placeholder: 'read-posts, delete-comments' }
                ]
            },
            {
                type: 'execute_workflow',
                name: 'Execute Sub-Workflow',
                description: 'Triggers another workflow, sends a payload, and receives output parameters',
                category: 'logic',
                icon: GitBranch,
                fields: [
                    { name: 'target_workflow_id', label: 'Select Sub-Workflow', type: 'select', options: [] },
                    { name: 'payload_data', label: 'Payload to Send (JSON)', type: 'textarea', placeholder: '{\n  "key": "value"\n}' },
                    { name: 'wait_for_completion', label: 'Wait for execution output', type: 'switch', defaultValue: true }
                ]
            }
        ]
    }
};

const ACCENT_COLOR_PRESETS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Crimson', value: '#e11d48' },
];

export default function Builder({ workflow, activeModules = [], availableWorkflows = [] }) {
    // -------------------------------------------------------------
    // Core Workflow Builder State
    // -------------------------------------------------------------
    const [nodes, setNodes] = useState(workflow?.nodes || []);
    const [connections, setConnections] = useState(workflow?.connections || []);
    const [customNodeTypes, setCustomNodeTypes] = useState(workflow?.custom_node_types || []);
    
    const [name, setName] = useState(workflow?.name || 'New Workflow');
    const [description, setDescription] = useState(workflow?.description || '');
    const [isActive, setIsActive] = useState(workflow?.is_active || false);

    // Canvas panning, zoom and interaction state
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });
    
    // Selection state
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [activeInspectorTab, setActiveInspectorTab] = useState('parameters');

    // Drag-and-drop / node/port dragging state
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });
    const [activeDragConnection, setActiveDragConnection] = useState(null);

    // Modals
    const [isCustomNodeModalOpen, setIsCustomNodeModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'

    // Test simulator state
    const [isTesting, setIsTesting] = useState(false);
    const [testingNodeStatuses, setTestingNodeStatuses] = useState({});
    const [testLogs, setTestLogs] = useState([]);
    const [isTestResultsOpen, setIsTestResultsOpen] = useState(false);

    // Expand/Collapse panel states
    const [isToolboxOpen, setIsToolboxOpen] = useState(true);
    const [leftSidebarTab, setLeftSidebarTab] = useState('components'); // 'components' or 'all_parameters'
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);
    
    // Custom Component Creator Modal fields
    const [newCustomName, setNewCustomName] = useState('');
    const [newCustomCategory, setNewCustomCategory] = useState('action');
    const [newCustomColor, setNewCustomColor] = useState('#6366f1');
    const [newCustomDesc, setNewCustomDesc] = useState('');
    const [newCustomFields, setNewCustomFields] = useState([]);
    
    // New Custom Field fields (inside the custom component creator)
    const [tempFieldName, setTempFieldName] = useState('');
    const [tempFieldLabel, setTempFieldLabel] = useState('');
    const [tempFieldType, setTempFieldType] = useState('text');
    const [tempFieldOptions, setTempFieldOptions] = useState('');

    const canvasRef = useRef(null);

    // Generate dynamic nodes based on active plugins/modules
    const pluginNodes = [];
    activeModules.forEach(mod => {
        const nameLower = mod.name.toLowerCase();
        if (nameLower === 'brevo') {
            pluginNodes.push({
                type: 'brevo_send',
                name: 'Brevo Email',
                description: 'Send marketing or transactional email via Brevo API',
                category: 'action',
                icon: Mail,
                fields: [
                    { name: 'sender', label: 'Sender Email', type: 'text', placeholder: 'noreply@kreatif.com' },
                    { name: 'to', label: 'To Email Address', type: 'text', placeholder: 'customer@example.com' },
                    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome!' },
                    { name: 'templateId', label: 'Brevo Template ID (Optional)', type: 'text', placeholder: '12' },
                    { name: 'body', label: 'Email Content', type: 'textarea', placeholder: 'Write email content...' }
                ]
            });
        } else if (nameLower === 'aiassistant') {
            pluginNodes.push({
                type: 'ai_generate',
                name: 'AI Prompt Assistant',
                description: 'Generate contents or replies using AI model prompt',
                category: 'action',
                icon: Zap,
                fields: [
                    { name: 'prompt', label: 'AI Prompt / Instructions', type: 'textarea', placeholder: 'Summarize user info...' },
                    { name: 'temperature', label: 'Temperature (Creativity)', type: 'select', options: ['0.2', '0.7', '1.0'], defaultValue: '0.7' }
                ]
            });
        } else if (nameLower === 'otpservice') {
            pluginNodes.push({
                type: 'otp_send',
                name: 'Send OTP SMS',
                description: 'Generate and send One-Time Password to recipient phone',
                category: 'action',
                icon: ShieldAlert,
                fields: [
                    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: '+62812...' },
                    { name: 'expiry', label: 'Expiry time (Minutes)', type: 'select', options: ['2', '5', '10'], defaultValue: '5' }
                ]
            });
        } else if (nameLower === 'emailtemplates') {
            pluginNodes.push({
                type: 'send_template_email',
                name: 'Send Template Email',
                description: 'Send custom email template configured in templates module',
                category: 'action',
                icon: Mail,
                fields: [
                    { name: 'template_alias', label: 'Template Slug / Name', type: 'text', placeholder: 'welcome-email' },
                    { name: 'to', label: 'Recipient Email', type: 'text', placeholder: 'user@example.com' }
                ]
            });
        } else if (nameLower === 'jobmanager') {
            pluginNodes.push({
                type: 'dispatch_job',
                name: 'Dispatch Queue Job',
                description: 'Add dynamic job process to Laravel queue runner',
                category: 'action',
                icon: Calendar,
                fields: [
                    { name: 'job_name', label: 'Job Class Name', type: 'text', placeholder: 'App\\Jobs\\ProcessData' },
                    { name: 'payload', label: 'Job Payload Data (JSON)', type: 'textarea', placeholder: '{"userId": 1}' }
                ]
            });
        } else if (nameLower === 'databasemanager') {
            pluginNodes.push({
                type: 'query_db',
                name: 'Query DB Table',
                description: 'Retrieve or insert dynamic records in custom tables',
                category: 'action',
                icon: Database,
                fields: [
                    { name: 'table', label: 'Table Name', type: 'text', placeholder: 'posts' },
                    { name: 'action', label: 'DB Operation', type: 'select', options: ['select', 'insert', 'update'], defaultValue: 'select' },
                    { name: 'where_clause', label: 'Query Filter (JSON)', type: 'text', placeholder: '{"id": 1}' }
                ]
            });
        }
    });

    // Save status timeout
    useEffect(() => {
        if (saveStatus === 'saved' || saveStatus === 'error') {
            const timer = setTimeout(() => setSaveStatus(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Handle background canvas zoom with scroll wheel
    const handleWheel = (e) => {
        e.preventDefault();
        const zoomIntensity = 0.08;
        let nextZoom = zoom + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity);
        nextZoom = Math.min(Math.max(0.5, nextZoom), 2);
        setZoom(nextZoom);
    };

    // Calculate node coordinates in canvas space
    const getCanvasCoords = (clientX, clientY) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (clientX - rect.left - panOffset.x) / zoom,
            y: (clientY - rect.top - panOffset.y) / zoom
        };
    };

    const getNodeFields = (node) => {
        if (!node) return [];
        // First look in custom node types if it is a custom node
        if (node.type && node.type.startsWith('custom_')) {
            const custom = customNodeTypes.find(c => c.type === node.type);
            return custom ? custom.fields : (node.fields || []);
        }
        
        // Look in plugins
        const pluginNode = pluginNodes.find(p => p.type === node.type);
        if (pluginNode) return pluginNode.fields;

        // Look in built-in categories
        for (const cat of Object.values(BUILT_IN_CATEGORIES)) {
            const template = cat.nodes.find(n => n.type === node.type);
            if (template) return template.fields;
        }

        // Fallback to whatever is saved on the node
        return node.fields || [];
    };

    // Add a node to canvas
    const handleAddNode = (template) => {
        // Position it nicely in the center of the viewport
        const centerPos = {
            x: (-panOffset.x + 300) / zoom,
            y: (-panOffset.y + 200) / zoom
        };

        // Build default values from schema
        const defaultData = {};
        template.fields.forEach(f => {
            defaultData[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
        });

        const newNode = {
            id: `node_${Date.now()}`,
            type: template.type,
            name: template.name,
            category: template.category,
            description: template.description,
            position: centerPos,
            color: template.color || null,
            data: defaultData,
            fields: template.fields
        };

        setNodes(prev => [...prev, newNode]);
        setActiveNodeId(newNode.id);
        setIsInspectorOpen(true);
    };

    // Delete a node
    const handleDeleteNode = (nodeId) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setConnections(prev => prev.filter(c => c.fromId !== nodeId && c.toId !== nodeId));
        if (activeNodeId === nodeId) {
            setActiveNodeId(null);
        }
    };

    // Canvas panning start
    const handleCanvasMouseDown = (e) => {
        if (e.target.closest('.workflow-node') || e.target.closest('.port-handle') || e.target.closest('.properties-inspector')) {
            return;
        }
        setIsDraggingCanvas(true);
        setCanvasDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    // Canvas dragging / Node dragging / Connection drawing
    const handleCanvasMouseMove = (e) => {
        if (isDraggingCanvas) {
            setPanOffset({
                x: e.clientX - canvasDragStart.x,
                y: e.clientY - canvasDragStart.y
            });
        } else if (draggingNodeId) {
            const currentCoords = getCanvasCoords(e.clientX, e.clientY);
            setNodes(prev => prev.map(node => {
                if (node.id === draggingNodeId) {
                    // Grid snap to 10px
                    return {
                        ...node,
                        position: {
                            x: Math.round((currentCoords.x - nodeDragOffset.x) / 10) * 10,
                            y: Math.round((currentCoords.y - nodeDragOffset.y) / 10) * 10
                        }
                    };
                }
                return node;
            }));
        } else if (activeDragConnection) {
            const currentCoords = getCanvasCoords(e.clientX, e.clientY);
            setActiveDragConnection(prev => ({
                ...prev,
                currentX: currentCoords.x,
                currentY: currentCoords.y
            }));
        }
    };

    // Drop mouse triggers
    const handleCanvasMouseUp = () => {
        setIsDraggingCanvas(false);
        setDraggingNodeId(null);
        setActiveDragConnection(null);
    };

    // Node Drag Start
    const handleNodeMouseDown = (e, nodeId) => {
        e.stopPropagation();
        setActiveNodeId(nodeId);
        setIsInspectorOpen(true);
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const mouseCoords = getCanvasCoords(e.clientX, e.clientY);
        setNodeDragOffset({
            x: mouseCoords.x - node.position.x,
            y: mouseCoords.y - node.position.y
        });
        setDraggingNodeId(nodeId);
    };

    // Handle connecting ports
    const handlePortMouseDown = (e, nodeId, portType) => {
        e.stopPropagation();
        e.preventDefault();
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Port coordinate offset calculations
        const portX = node.position.x + (portType.startsWith('output') ? 240 : 0);
        const portY = node.position.y + (portType === 'output_true' ? 28 : (portType === 'output_false' ? 56 : 40));

        setActiveDragConnection({
            fromId: nodeId,
            fromPort: portType,
            startX: portX,
            startY: portY,
            currentX: portX,
            currentY: portY
        });
    };

    const handlePortMouseUp = (e, targetNodeId, targetPortType) => {
        e.stopPropagation();
        if (!activeDragConnection) return;

        // Verify valid connection (output -> input and different nodes)
        if (
            activeDragConnection.fromId !== targetNodeId &&
            activeDragConnection.fromPort !== targetPortType &&
            activeDragConnection.fromPort.startsWith('output') &&
            targetPortType === 'input'
        ) {
            // Check if connection already exists
            const exists = connections.some(c => 
                c.fromId === activeDragConnection.fromId && 
                c.fromPort === activeDragConnection.fromPort &&
                c.toId === targetNodeId
            );

            if (!exists) {
                setConnections(prev => [...prev, {
                    id: `conn_${Date.now()}`,
                    fromId: activeDragConnection.fromId,
                    toId: targetNodeId,
                    fromPort: activeDragConnection.fromPort,
                    toPort: targetPortType
                }]);
            }
        }
        setActiveDragConnection(null);
    };

    // Remove connection line
    const handleRemoveConnection = (connectionId) => {
        setConnections(prev => prev.filter(c => c.id !== connectionId));
    };

    // Save changes to DB
    const handleSaveWorkflow = async () => {
        if (!workflow?.id) return;
        setSaveStatus('saving');
        try {
            await axios.put(route('workflows.update', workflow.id), {
                name,
                description,
                is_active: isActive,
                nodes,
                connections,
                custom_node_types: customNodeTypes
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error('Failed to save workflow', error);
            setSaveStatus('error');
        }
    };

    // Test simulation execution runner (n8n-style)
    const handleRunTest = async () => {
        if (nodes.length === 0) {
            alert("Please add at least one node to test.");
            return;
        }

        setIsTesting(true);
        setIsTestResultsOpen(true);
        setTestLogs([]);
        setTestingNodeStatuses({});

        // Identify trigger nodes
        const triggers = nodes.filter(n => n.category === 'trigger');
        if (triggers.length === 0) {
            setTestLogs(prev => [...prev, {
                id: `log_${Date.now()}_sys`,
                nodeId: 'system',
                nodeName: 'System Diagnostic',
                status: 'info',
                message: 'No trigger node defined. Starting mock simulation using the first available node.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }

        const startNodes = triggers.length > 0 ? triggers : [nodes[0]];
        const queue = [...startNodes.map(n => ({ node: n, incomingData: { triggerTime: new Date().toISOString() } }))];
        const processedNodeIds = new Set();
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        while (queue.length > 0) {
            const currentItem = queue.shift();
            const currentNode = currentItem.node;
            const incomingData = currentItem.incomingData;

            if (processedNodeIds.has(currentNode.id)) continue;
            processedNodeIds.add(currentNode.id);

            // Update node visual border status to running
            setTestingNodeStatuses(prev => ({ ...prev, [currentNode.id]: 'running' }));
            setTestLogs(prev => [...prev, {
                id: `log_${Date.now()}_run_${currentNode.id}`,
                nodeId: currentNode.id,
                nodeName: currentNode.name,
                status: 'running',
                message: `Executing node actions and processing parameters...`,
                timestamp: new Date().toLocaleTimeString()
            }]);

            await delay(1200); // Simulated delay for visual feedback

            // Resolve dynamic properties
            const resolvedData = {
                ...currentNode.data,
                executionStatus: 'SUCCESS',
                executedAt: new Date().toISOString()
            };

            setTestingNodeStatuses(prev => ({ ...prev, [currentNode.id]: 'success' }));
            setTestLogs(prev => [...prev, {
                id: `log_${Date.now()}_success_${currentNode.id}`,
                nodeId: currentNode.id,
                nodeName: currentNode.name,
                status: 'success',
                message: `Parameters processed. Action executed successfully.`,
                output: JSON.stringify(resolvedData, null, 2),
                timestamp: new Date().toLocaleTimeString()
            }]);

            // Track connections out of this node
            const outgoingConns = connections.filter(c => c.fromId === currentNode.id);
            outgoingConns.forEach(conn => {
                const targetNode = nodes.find(n => n.id === conn.toId);
                if (targetNode) {
                    if (currentNode.type === 'conditional_branch' || currentNode.type === 'check_user_role') {
                        // Mock conditional routing - Default to follow the TRUE path, but logs false path if true is disconnected
                        const isTruePath = conn.fromPort === 'output_true';
                        setTestLogs(prev => [...prev, {
                            id: `log_${Date.now()}_route_${conn.id}`,
                            nodeId: currentNode.id,
                            nodeName: currentNode.name,
                            status: 'info',
                            message: `Condition evaluated. Routing payload to downstream connection [${isTruePath ? 'TRUE' : 'FALSE'} Path]`,
                            timestamp: new Date().toLocaleTimeString()
                        }]);
                    }
                    queue.push({ node: targetNode, incomingData: resolvedData });
                }
            });
        }

        setIsTesting(false);
    };

    // Node parameter changes (n8n property inspector)
    const handleNodeDataChange = (nodeId, fieldName, value) => {
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        [fieldName]: value
                    }
                };
            }
            return n;
        }));
    };

    // Add field to custom component definition
    const handleAddCustomField = () => {
        if (!tempFieldName || !tempFieldLabel) return;
        const newField = {
            name: tempFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            label: tempFieldLabel,
            type: tempFieldType,
            options: tempFieldType === 'select' ? tempFieldOptions.split(',').map(s => s.trim()) : []
        };
        setNewCustomFields(prev => [...prev, newField]);
        setTempFieldName('');
        setTempFieldLabel('');
        setTempFieldType('text');
        setTempFieldOptions('');
    };

    // Save custom component definition
    const handleSaveCustomComponent = () => {
        if (!newCustomName || newCustomFields.length === 0) return;

        const newType = `custom_${newCustomName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const newComponent = {
            type: newType,
            name: newCustomName,
            category: newCustomCategory,
            description: newCustomDesc || 'Custom user component',
            color: newCustomColor,
            fields: newCustomFields
        };

        setCustomNodeTypes(prev => [...prev, newComponent]);
        
        // Reset modal fields
        setNewCustomName('');
        setNewCustomCategory('action');
        setNewCustomColor('#6366f1');
        setNewCustomDesc('');
        setNewCustomFields([]);
        setIsCustomNodeModalOpen(false);
    };

    const activeNode = nodes.find(n => n.id === activeNodeId);

    // SVG line rendering function between nodes
    const renderConnectionLine = (c) => {
        const fromNode = nodes.find(n => n.id === c.fromId);
        const toNode = nodes.find(n => n.id === c.toId);
        if (!fromNode || !toNode) return null;

        // Port exact coordinates
        const startX = fromNode.position.x + 240;
        const startY = fromNode.position.y + (c.fromPort === 'output_true' ? 28 : (c.fromPort === 'output_false' ? 56 : 40));
        const endX = toNode.position.x;
        const endY = toNode.position.y + 40;

        // Bezier handles
        const controlOffset = Math.abs(endX - startX) * 0.5;
        const pathData = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;

        // Color-code connection wires
        let lineColor = fromNode.color || (BUILT_IN_CATEGORIES[fromNode.category]?.accentColor || '#6366f1');
        if (c.fromPort === 'output_true') lineColor = '#10b981';
        if (c.fromPort === 'output_false') lineColor = '#f43f5e';

        return (
            <g key={c.id} className="group/line">
                <path
                    d={pathData}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    className="opacity-0 group-hover/line:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => handleRemoveConnection(c.id)}
                />
                <path
                    d={pathData}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3.5"
                    strokeDasharray={fromNode.is_active ? 'none' : 'none'}
                    className="transition-all duration-300 drop-shadow-sm pointer-events-none"
                />
                {/* Delete button middle of line indicator */}
                <circle
                    cx={(startX + endX) / 2}
                    cy={(startY + endY) / 2}
                    r="8"
                    className="fill-red-500 opacity-0 group-hover/line:opacity-100 cursor-pointer shadow-sm stroke-white stroke-2"
                    onClick={() => handleRemoveConnection(c.id)}
                />
            </g>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('workflows.index')}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none px-1"
                                />
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {isActive ? 'Live' : 'Draft'}
                                </span>
                            </div>
                            <input
                                type="text"
                                value={description}
                                placeholder="Add a description to this automation..."
                                onChange={e => setDescription(e.target.value)}
                                className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none px-1 w-80 truncate"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRunTest}
                            disabled={isTesting}
                            className="inline-flex items-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-amber-100 gap-1.5 disabled:opacity-50"
                        >
                            <PlayCircle className="w-4 h-4" />
                            {isTesting ? 'Running Test...' : 'Test Run'}
                        </button>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                isActive 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {isActive ? 'Deactivate' : 'Activate Automation'}
                        </button>
                        <button
                            onClick={handleSaveWorkflow}
                            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-indigo-100 gap-1.5"
                        >
                            <Save className="w-4 h-4" />
                            {saveStatus === 'saving' ? 'Saving...' : 'Save Workflow'}
                        </button>

                        {saveStatus === 'saved' && (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Changes saved!
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-xs text-red-500 font-semibold">Failed to save.</span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Builder | ${name}`} />

            <div className="flex h-[calc(100vh-6.5rem)] bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden relative select-none">
                
                {/* 1. Left Component Sidebar */}
                {isToolboxOpen && (
                    <div className="w-72 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Components Toolbox</h3>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setIsCustomNodeModalOpen(true)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Custom
                                    </button>
                                    <button
                                        onClick={() => setIsToolboxOpen(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                                        title="Hide Toolbox"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Custom Component List */}
                            {customNodeTypes.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider">Custom Components</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {customNodeTypes.map(c => (
                                            <button
                                                key={c.type}
                                                onClick={() => handleAddNode(c)}
                                                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-start gap-3 shadow-sm"
                                            >
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                                                    style={{ backgroundColor: c.color }}
                                                >
                                                    <Code className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="text-xs font-bold text-gray-800 truncate">{c.name}</h4>
                                                    <p className="text-[10px] text-gray-400 truncate">{c.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Plugin Integrations */}
                            {pluginNodes.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-wider">Plugin Integrations</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {pluginNodes.map(node => {
                                            const Icon = node.icon || Zap;
                                            return (
                                                <button
                                                    key={node.type}
                                                    onClick={() => handleAddNode(node)}
                                                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-start gap-3 shadow-sm"
                                                >
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-xs font-bold text-gray-800 truncate">{node.name}</h4>
                                                        <p className="text-[10px] text-gray-400 truncate">{node.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Built-in categories */}
                            {Object.entries(BUILT_IN_CATEGORIES).map(([catKey, cat]) => (
                                <div key={catKey} className="space-y-2">
                                    <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">{cat.label}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {cat.nodes.map(node => {
                                            const Icon = node.icon;
                                            return (
                                                <button
                                                    key={node.type}
                                                    onClick={() => handleAddNode(node)}
                                                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-start gap-3 shadow-sm"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${cat.color}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="text-xs font-bold text-gray-800 truncate">{node.name}</h4>
                                                        <p className="text-[10px] text-gray-400 truncate">{node.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-center text-xs font-medium text-gray-400">
                            <Info className="w-4 h-4" /> Drag canvas to pan, scroll to zoom.
                        </div>
                    </div>
                )}

                {/* 2. Interactive SVG Dotted Canvas Workspace */}
                <div
                    ref={canvasRef}
                    className="flex-1 h-full relative overflow-hidden outline-none bg-gray-50 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onWheel={handleWheel}
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                    }}
                >
                    {/* SVG Connections Canvas Container */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{
                            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                            transformOrigin: '0 0'
                        }}
                    >
                        {/* 1. Existing Connections */}
                        {connections.map(renderConnectionLine)}

                        {/* 2. Active connection being dragged */}
                        {activeDragConnection && (
                            <path
                                d={`M ${activeDragConnection.startX} ${activeDragConnection.startY} C ${activeDragConnection.startX + Math.abs(activeDragConnection.currentX - activeDragConnection.startX) * 0.5} ${activeDragConnection.startY}, ${activeDragConnection.currentX - Math.abs(activeDragConnection.currentX - activeDragConnection.startX) * 0.5} ${activeDragConnection.currentY}, ${activeDragConnection.currentX} ${activeDragConnection.currentY}`}
                                fill="none"
                                stroke="#a5b4fc"
                                strokeWidth="3"
                                strokeDasharray="6 4"
                            />
                        )}
                    </svg>

                    {/* Nodes layer container */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                            transformOrigin: '0 0'
                        }}
                    >
                        {nodes.map(node => {
                            const isSelected = node.id === activeNodeId;
                            const isTrigger = node.category === 'trigger';
                            const customAccent = node.color || null;
                            const defaultAccent = BUILT_IN_CATEGORIES[node.category]?.accentColor || '#6366f1';
                            const accentColor = customAccent || defaultAccent;

                            const testStatus = testingNodeStatuses[node.id];
                            const statusBorder = testStatus === 'running' 
                                ? 'border-yellow-400 ring-4 ring-yellow-100 animate-pulse shadow-md shadow-yellow-50' 
                                : testStatus === 'success' 
                                ? 'border-emerald-500 ring-4 ring-emerald-100 shadow-md shadow-emerald-50' 
                                : isSelected 
                                ? 'border-indigo-600 ring-4 ring-indigo-100' 
                                : 'border-gray-200/80 hover:border-gray-300';

                            return (
                                <div
                                    key={node.id}
                                    className={`workflow-node absolute w-60 bg-white border rounded-2xl shadow-lg pointer-events-auto transition-all ${statusBorder}`}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                    }}
                                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                >
                                    {/* Top node header handle */}
                                    <div 
                                        className="h-2 rounded-t-2xl" 
                                        style={{ backgroundColor: accentColor }}
                                    />

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-xs font-extrabold text-gray-800 truncate w-40">{node.name}</h4>
                                                <p className="text-[10px] text-gray-400 capitalize">{node.category}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNode(node.id);
                                                }}
                                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">{node.description}</p>
                                    </div>

                                    {/* Input Connection Port (on the left) - Not visible on triggers */}
                                    {!isTrigger && (
                                        <div
                                            className="port-handle absolute left-0 top-10 w-4 h-4 -ml-2 rounded-full border-2 border-white bg-indigo-500 shadow-md cursor-crosshair hover:scale-125 transition-transform"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => handlePortMouseUp(e, node.id, 'input')}
                                            title="Connect trigger/node to this input"
                                        />
                                    )}

                                    {/* Output Connection Port (on the right) */}
                                    {node.type === 'conditional_branch' || node.type === 'check_user_role' ? (
                                        <>
                                            <div
                                                className="port-handle absolute right-0 top-7 w-4 h-4 -mr-2 rounded-full border-2 border-white bg-emerald-500 shadow-md cursor-crosshair hover:scale-125 transition-transform"
                                                onMouseDown={(e) => handlePortMouseDown(e, node.id, 'output_true')}
                                                onMouseUp={(e) => handlePortMouseUp(e, node.id, 'output_true')}
                                                title="True Path"
                                            />
                                            <span className="absolute right-3 top-[22px] text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded pointer-events-none">TRUE</span>

                                            <div
                                                className="port-handle absolute right-0 top-14 w-4 h-4 -mr-2 rounded-full border-2 border-white bg-rose-500 shadow-md cursor-crosshair hover:scale-125 transition-transform"
                                                onMouseDown={(e) => handlePortMouseDown(e, node.id, 'output_false')}
                                                onMouseUp={(e) => handlePortMouseUp(e, node.id, 'output_false')}
                                                title="False Path"
                                            />
                                            <span className="absolute right-3 top-[50px] text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded pointer-events-none">FALSE</span>
                                        </>
                                    ) : (
                                        <div
                                            className="port-handle absolute right-0 top-10 w-4 h-4 -mr-2 rounded-full border-2 border-white bg-indigo-500 shadow-md cursor-crosshair hover:scale-125 transition-transform"
                                            onMouseDown={(e) => handlePortMouseDown(e, node.id, 'output')}
                                            onMouseUp={(e) => handlePortMouseUp(e, node.id, 'output')}
                                            title="Drag connection to another node"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Canvas controls bottom left */}
                    <div className="absolute bottom-6 left-6 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-100 flex gap-2 z-10 pointer-events-auto">
                        <button
                            onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                            className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-all"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                            className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-all"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
                            className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-all"
                            title="Recenter"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bottom Test execution Log Console (n8n style) */}
                    {isTestResultsOpen && (
                        <div className="absolute bottom-0 left-0 right-0 h-52 bg-white border-t border-gray-200 z-20 flex flex-col shadow-2xl pointer-events-auto">
                            <div className="px-5 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-4.5 h-4.5 text-indigo-600" />
                                    <h3 className="text-xs font-extrabold text-gray-900">Test Execution Console</h3>
                                    {isTesting ? (
                                        <span className="text-[10px] bg-yellow-100 text-yellow-800 font-extrabold px-2 py-0.5 rounded-full animate-pulse">Running Simulation...</span>
                                    ) : (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">Execution Completed</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsTestResultsOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-gray-700 space-y-2 bg-gray-50/50">
                                {testLogs.map(log => (
                                    <div key={log.id} className="pb-2 border-b border-gray-200/50 last:border-0 last:pb-0 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[9px] text-gray-400 font-bold">{log.timestamp}</span>
                                            <span className="font-extrabold text-gray-900">{log.nodeName}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                                log.status === 'success' 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                    : log.status === 'running' 
                                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' 
                                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                            }`}>
                                                {log.status}
                                            </span>
                                            <span className="text-gray-600 font-semibold">{log.message}</span>
                                        </div>
                                        {log.output && (
                                            <pre className="p-2 bg-white border border-gray-150 rounded-xl text-[10px] text-gray-500 overflow-x-auto max-h-24">
                                                {log.output}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                                {testLogs.length === 0 && (
                                    <p className="text-gray-400 italic text-center py-4 text-xs">No execution logs yet. Click "Test Run" to simulate.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Floating toolbox expand handle */}
                    {!isToolboxOpen && (
                        <button
                            onClick={() => setIsToolboxOpen(true)}
                            className="absolute left-4 top-4 bg-white border border-gray-250 px-3 py-2 rounded-xl shadow-lg z-30 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all pointer-events-auto flex items-center gap-1.5 text-xs font-bold"
                            title="Show Toolbox"
                        >
                            <ChevronRight className="w-4 h-4" />
                            Toolbox
                        </button>
                    )}

                    {/* Floating properties expand handle */}
                    {activeNode && !isInspectorOpen && (
                        <button
                            onClick={() => setIsInspectorOpen(true)}
                            className="absolute right-4 top-4 bg-white border border-gray-250 px-3 py-2 rounded-xl shadow-lg z-30 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all pointer-events-auto flex items-center gap-1.5 text-xs font-bold"
                            title="Show Properties"
                        >
                            <Sliders className="w-4 h-4" />
                            Properties
                        </button>
                    )}
                </div>

                {/* 3. n8n-Style Properties Sidebar Inspector Drawer */}
                {activeNode && isInspectorOpen ? (
                    <div className="w-80 bg-white border-l border-gray-200 flex flex-col justify-between shrink-0 properties-inspector z-10 shadow-2xl">
                        <div>
                            {/* Panel Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 truncate w-48">{activeNode.name}</h3>
                                    <p className="text-[10px] text-gray-400">Node ID: {activeNode.id}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsInspectorOpen(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                                        title="Hide Properties"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setActiveNodeId(null)}
                                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                                        title="Deselect Node"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Tab Bar */}
                            <div className="flex border-b border-gray-100 text-xs font-bold text-center">
                                <button
                                    onClick={() => setActiveInspectorTab('parameters')}
                                    className={`flex-1 py-3 border-b-2 transition-all flex justify-center items-center gap-1.5 ${
                                        activeInspectorTab === 'parameters'
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <Sliders className="w-3.5 h-3.5" />
                                    Parameters
                                </button>
                                <button
                                    onClick={() => setActiveInspectorTab('settings')}
                                    className={`flex-1 py-3 border-b-2 transition-all flex justify-center items-center gap-1.5 ${
                                        activeInspectorTab === 'settings'
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Settings
                                </button>
                            </div>

                            {/* Tab Content */}
                             <div className="p-5 overflow-y-auto max-h-[calc(100vh-17.5rem)] space-y-4">
                                {activeInspectorTab === 'parameters' ? (
                                    <>
                                        {getNodeFields(activeNode)?.map(field => (
                                            <div key={field.name} className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">
                                                    {field.label}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        value={activeNode.data[field.name] || ''}
                                                        onChange={e => handleNodeDataChange(activeNode.id, field.name, e.target.value)}
                                                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700 bg-white"
                                                    >
                                                        {field.name === 'target_workflow_id' ? (
                                                            <>
                                                                <option value="">-- Select Workflow --</option>
                                                                {availableWorkflows.map(w => (
                                                                    <option key={w.id} value={w.id}>{w.name} (ID: {w.id})</option>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            field.options?.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                ) : field.type === 'textarea' ? (
                                                    <textarea
                                                        rows="4"
                                                        placeholder={field.placeholder || ''}
                                                        value={activeNode.data[field.name] || ''}
                                                        onChange={e => handleNodeDataChange(activeNode.id, field.name, e.target.value)}
                                                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700 placeholder-gray-400"
                                                    />
                                                ) : field.type === 'switch' ? (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!activeNode.data[field.name]}
                                                            onChange={e => handleNodeDataChange(activeNode.id, field.name, e.target.checked)}
                                                            className="w-4 h-4 text-indigo-600 border-gray-200 rounded focus:ring-indigo-500"
                                                        />
                                                        <span className="ml-2 text-xs font-semibold text-gray-600">Enabled</span>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        readOnly={field.readonly}
                                                        placeholder={field.placeholder || ''}
                                                        value={activeNode.data[field.name] || ''}
                                                        onChange={e => handleNodeDataChange(activeNode.id, field.name, e.target.value)}
                                                        className={`w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700 placeholder-gray-400 ${
                                                            field.readonly ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-dashed' : ''
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {(!getNodeFields(activeNode) || getNodeFields(activeNode).length === 0) && (
                                            <p className="text-xs text-gray-400 italic">No parameters required for this node.</p>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Display Name</label>
                                            <input
                                                type="text"
                                                value={activeNode.name}
                                                onChange={e => setNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, name: e.target.value } : n))}
                                                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Description</label>
                                            <textarea
                                                rows="3"
                                                value={activeNode.description || ''}
                                                onChange={e => setNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, description: e.target.value } : n))}
                                                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                            <button
                                onClick={() => handleDeleteNode(activeNode.id)}
                                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Component
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-80 bg-white border-l border-gray-200 flex flex-col justify-center items-center shrink-0 text-center p-6 text-gray-400">
                        <Sliders className="w-10 h-10 mb-3 text-gray-300" />
                        <h4 className="font-bold text-gray-700 text-sm">No node selected</h4>
                        <p className="text-xs text-gray-400 max-w-[200px] mt-1 font-medium leading-relaxed">
                            Click on any node to view and edit its parameters in this sidebar drawer.
                        </p>
                    </div>
                )}
            </div>

            {/* Custom Component definition Creator Modal */}
            {isCustomNodeModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsCustomNodeModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100">
                            <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                        <Code className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Define Custom Component</h3>
                                        <p className="text-xs text-gray-400 font-medium">Create custom nodes to reuse in your workflow builder</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Component Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Send SMS Alert"
                                            value={newCustomName}
                                            onChange={e => setNewCustomName(e.target.value)}
                                            className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                                        <select
                                            value={newCustomCategory}
                                            onChange={e => setNewCustomCategory(e.target.value)}
                                            className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold bg-white"
                                        >
                                            <option value="trigger">Trigger Component</option>
                                            <option value="action">Action Component</option>
                                            <option value="logic">Logic / flow</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Theme Accent Color</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {ACCENT_COLOR_PRESETS.map(preset => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => setNewCustomColor(preset.value)}
                                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center`}
                                                style={{ 
                                                    backgroundColor: preset.value,
                                                    borderColor: newCustomColor === preset.value ? '#ffffff' : 'transparent',
                                                    boxShadow: newCustomColor === preset.value ? '0 0 0 2px #6366f1' : 'none'
                                                }}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Briefly describe what this custom component does"
                                        value={newCustomDesc}
                                        onChange={e => setNewCustomDesc(e.target.value)}
                                        className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                                    />
                                </div>

                                {/* Custom Parameters Form Creator Section */}
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold text-gray-800 mb-3">Build Parameters Schema</h4>
                                    
                                    {/* Temporary parameter constructor fields */}
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Field Name Key</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. phoneNumber"
                                                    value={tempFieldName}
                                                    onChange={e => setTempFieldName(e.target.value)}
                                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Display Label</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Phone Number"
                                                    value={tempFieldLabel}
                                                    onChange={e => setTempFieldLabel(e.target.value)}
                                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Input Type</label>
                                                <select
                                                    value={tempFieldType}
                                                    onChange={e => setTempFieldType(e.target.value)}
                                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                                                >
                                                    <option value="text">Text Input</option>
                                                    <option value="textarea">Text Area</option>
                                                    <option value="switch">Switch / Checkbox</option>
                                                    <option value="select">Dropdown Select</option>
                                                </select>
                                            </div>
                                            {tempFieldType === 'select' && (
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Options (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="OptionA, OptionB, OptionC"
                                                        value={tempFieldOptions}
                                                        onChange={e => setTempFieldOptions(e.target.value)}
                                                        className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAddCustomField}
                                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Parameter to Schema
                                        </button>
                                    </div>

                                    {/* Display created fields */}
                                    {newCustomFields.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            <p className="text-[10px] font-bold text-gray-400">Created Parameters Schema ({newCustomFields.length})</p>
                                            {newCustomFields.map((field, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-xl text-xs">
                                                    <div className="font-semibold text-gray-700">
                                                        {field.label} <span className="text-[10px] text-gray-400 font-medium">({field.name} - {field.type})</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewCustomFields(prev => prev.filter((_, i) => i !== idx))}
                                                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-amber-500 italic flex items-center gap-1.5 bg-amber-50 p-3 rounded-xl border border-amber-200/50">
                                            <Info className="w-4 h-4 shrink-0" />
                                            Please construct at least one parameter/field for this component definition.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomNodeModalOpen(false)}
                                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={!newCustomName || newCustomFields.length === 0}
                                    onClick={handleSaveCustomComponent}
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                                >
                                    Create Component
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
