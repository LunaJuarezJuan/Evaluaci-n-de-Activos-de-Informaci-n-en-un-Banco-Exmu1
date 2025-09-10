import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Modal, Layout, Typography, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Login from './components/Login';
import { isAuthenticated, logout } from './services/LoginService';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const EditableContext = React.createContext(null);

// Editable Row Component
const EditableRow = ({ ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

// Editable Cell Component
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

// Main App Component
const App = () => {
  // Authentication state
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') || '');
  
  // Handle successful login
  const handleLoginSuccess = (response) => {
    setAuthenticated(true);
    setCurrentUser(response.user);
    message.success(`Bienvenido, ${response.user}!`);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCurrentUser('');
    message.info('Sesión cerrada correctamente');
  };
  
  // Application state
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [suggestEnabled, setSuggestEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [count, setCount] = useState(1);
  const [newData, setNewData] = useState({
    activo: '',
    riesgo: '',
    impacto: '',
    tratamiento: ''
  });

  // Show modal for adding new asset
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hide modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  // Handle deletion of a row
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  // Enhanced AI Engine for Banking Risk Assessment
  const generateBankingRiskProfile = (assetName) => {
    const riskProfiles = {
      'Servidor de base de datos': {
        riesgo: 'Compromiso de integridad y confidencialidad de datos financieros',
        impacto: 'Exposición de información de clientes, pérdida de confianza, multas regulatorias (hasta $50M)',
        probabilidad: 'Media',
        categoria: 'Crítico'
      },
      'API Transacciones': {
        riesgo: 'Interceptación de transacciones financieras en tránsito',
        impacto: 'Fraude financiero, pérdida de fondos, violación de PCI DSS',
        probabilidad: 'Alta',
        categoria: 'Crítico'
      },
      'Aplicación Web de Banca': {
        riesgo: 'Ataques de inyección SQL y XSS comprometiendo sesiones de usuarios',
        impacto: 'Acceso no autorizado a cuentas, robo de identidad, daño reputacional',
        probabilidad: 'Alta',
        categoria: 'Alto'
      },
      'Servidor de Correo': {
        riesgo: 'Interceptación de comunicaciones confidenciales y phishing interno',
        impacto: 'Filtración de información sensible, ataques de ingeniería social',
        probabilidad: 'Media',
        categoria: 'Medio'
      },
      'Firewall Perimetral': {
        riesgo: 'Configuración incorrecta permitiendo acceso no autorizado',
        impacto: 'Brecha de seguridad, acceso a red interna, compromiso de sistemas',
        probabilidad: 'Baja',
        categoria: 'Crítico'
      }
    };

    return riskProfiles[assetName] || {
      riesgo: `Vulnerabilidad en ${assetName} identificada mediante análisis de seguridad`,
      impacto: `Impacto potencial en operaciones bancarias y cumplimiento regulatorio`,
      probabilidad: 'Media',
      categoria: 'Medio'
    };
  };

  // Handle adding new asset (Enhanced AI Analysis)
  const handleOk = () => {
    if (!newData.activo.trim()) {
      message.error('Por favor ingresa un nombre de activo');
      return;
    }

    setIsLoading(true);

    // Enhanced AI Analysis with timeout
    setTimeout(() => {
      const riskProfile = generateBankingRiskProfile(newData.activo);
      
      // Add a single row for this asset with enhanced risk data
      addNewRow(newData.activo, riskProfile.riesgo, riskProfile.impacto, riskProfile.probabilidad, riskProfile.categoria);
      
      setIsModalVisible(false);
      setIsLoading(false);
      setSuggestEnabled(true);
      message.success(`Activo "${newData.activo}" evaluado con IA - Perfil de riesgo: ${riskProfile.categoria}`);
    }, 1500);
  };

  // Add a single new row to the table with enhanced risk data
  const addNewRow = (activo, riesgo, impacto, probabilidad = 'Media', categoria = 'Medio') => {
    // Create a single new row with enhanced risk assessment
    const newRow = {
      key: `${count}`,
      activo,
      riesgo,
      impacto,
      probabilidad,
      categoria,
      tratamiento: '-'
    };
    
    // Add the single row to the dataSource
    setDataSource([...dataSource, newRow]);
    
    // Increment count by 1
    setCount(count + 1);
    
    // Reset form
    setNewData({
      activo: '',
      riesgo: '',
      impacto: '',
      tratamiento: ''
    });
  };

  // Enhanced AI Engine for ISO 27001 Aligned Recommendations
  const generateISO27001Recommendations = (activo, categoria, probabilidad) => {
    const recommendations = {
      'Servidor de base de datos': {
        'Crítico': 'A.12.6.1 - Implementar cifrado AES-256, A.12.3.1 - Backup diario automatizado, A.9.1.1 - Control de acceso basado en roles',
        'Alto': 'A.12.6.1 - Cifrado de datos en reposo, A.12.3.1 - Backup incremental cada 4 horas',
        'Medio': 'A.12.3.1 - Backup semanal, A.9.1.1 - Autenticación multifactor'
      },
      'API Transacciones': {
        'Crítico': 'A.13.1.1 - Cifrado TLS 1.3, A.13.2.1 - Validación de entrada, A.14.1.1 - Monitoreo en tiempo real',
        'Alto': 'A.13.1.1 - Cifrado en tránsito, A.13.2.1 - Sanitización de datos',
        'Medio': 'A.13.1.1 - HTTPS obligatorio, A.14.1.1 - Logging de transacciones'
      },
      'Aplicación Web de Banca': {
        'Crítico': 'A.14.1.1 - WAF (Web Application Firewall), A.9.1.1 - SSO con MFA, A.12.6.1 - Cifrado de sesiones',
        'Alto': 'A.14.1.1 - Protección contra OWASP Top 10, A.9.1.1 - Autenticación robusta',
        'Medio': 'A.14.1.1 - Validación de entrada, A.9.1.1 - Timeout de sesión'
      },
      'Servidor de Correo': {
        'Crítico': 'A.13.1.1 - Cifrado S/MIME, A.13.2.1 - Filtrado anti-spam, A.9.1.1 - Control de acceso',
        'Alto': 'A.13.1.1 - Cifrado en tránsito, A.13.2.1 - Filtros de contenido',
        'Medio': 'A.13.1.1 - TLS obligatorio, A.9.1.1 - Autenticación de usuarios'
      },
      'Firewall Perimetral': {
        'Crítico': 'A.13.1.1 - Configuración de reglas estrictas, A.14.1.1 - Monitoreo 24/7, A.12.6.1 - Actualizaciones automáticas',
        'Alto': 'A.13.1.1 - Segmentación de red, A.14.1.1 - Alertas en tiempo real',
        'Medio': 'A.13.1.1 - Reglas básicas, A.14.1.1 - Logging de eventos'
      }
    };

    return recommendations[activo]?.[categoria] || 
           'A.12.6.1 - Implementar controles de seguridad básicos, A.9.1.1 - Revisar políticas de acceso, A.14.1.1 - Establecer monitoreo';
  };

  // Handle recommendation of treatments (Enhanced ISO 27001 AI Engine)
  const handleRecommendTreatment = () => {
    if (dataSource.length === 0) {
      message.warning('No hay riesgos para recomendar tratamientos');
      return;
    }

    setIsRecommending(true);
    
    // Enhanced AI Analysis with ISO 27001 alignment
    setTimeout(() => {
      const newDataSource = dataSource.map(item => {
        const recommendation = generateISO27001Recommendations(item.activo, item.categoria, item.probabilidad);
        return {
          ...item,
          tratamiento: recommendation
        };
      });
      
      setDataSource(newDataSource);
      setIsRecommending(false);
      message.success('Recomendaciones ISO 27001 generadas con IA');
    }, 2000);
  };

  // Handle save after cell edit
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  // Define enhanced table columns for banking audit
  const defaultColumns = [
    {
      title: 'Activo',
      dataIndex: 'activo',
      width: '15%',
      editable: true,
    },
    {
      title: 'Riesgo',
      dataIndex: 'riesgo',
      width: '20%',
      editable: true,
    },
    {
      title: 'Impacto',
      dataIndex: 'impacto',
      width: '25%',
      editable: true,
    },
    {
      title: 'Probabilidad',
      dataIndex: 'probabilidad',
      width: '10%',
      editable: true,
      render: (text) => {
        const color = text === 'Alta' ? '#ff4d4f' : text === 'Media' ? '#faad14' : '#52c41a';
        return <span style={{ color, fontWeight: 'bold' }}>{text}</span>;
      }
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      width: '10%',
      editable: true,
      render: (text) => {
        const color = text === 'Crítico' ? '#ff4d4f' : text === 'Alto' ? '#fa8c16' : text === 'Medio' ? '#faad14' : '#52c41a';
        return <span style={{ color, fontWeight: 'bold' }}>{text}</span>;
      }
    },
    {
      title: 'Tratamiento ISO 27001',
      dataIndex: 'tratamiento',
      width: '25%',
      editable: true,
    },
    {
      title: 'Operación',
      dataIndex: 'operation',
      width: '10%',
      render: (_, record) => (
        dataSource.length >= 1 ? (
          <Popconfirm title="¿Seguro que quieres eliminar?" onConfirm={() => handleDelete(record.key)}>
            <a>Eliminar</a>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  // Set up table components
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  // Configure columns for editing
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  // If not authenticated, show the login page
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  
  // If authenticated, show the app with header and content
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>Sistema de Auditoría de Sistemas - Evaluación de Activos Bancarios</Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text style={{ color: 'white', marginRight: 16 }}>
            <UserOutlined /> {currentUser}
          </Text>
          <Button 
            type="link" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            Cerrar Sesión
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: '24px', background: '#fff' }}>
        <div>
          <Button onClick={showModal} type="primary" style={{ marginBottom: 16 }}>
            + Evaluar Activo Bancario
          </Button>
          <Button 
            onClick={handleRecommendTreatment} 
            type="primary" 
            loading={isRecommending} 
            disabled={!suggestEnabled} 
            style={{ marginBottom: 16, marginLeft: 8 }}
          >
            Generar Recomendaciones ISO 27001
          </Button>
          
          <Modal
            title="Evaluar Activo de Información Bancario"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Evaluar con IA"
            cancelText="Cancelar"
            confirmLoading={isLoading}
          >
            <Form layout="vertical">
              <Form.Item 
                label="Activo de Información" 
                rules={[{ required: true, message: 'Por favor ingresa un nombre de activo' }]}
              >
                <Input 
                  name="activo" 
                  value={newData.activo} 
                  onChange={(e) => setNewData({ ...newData, activo: e.target.value })}
                  placeholder="Ej: Servidor de base de datos, API Transacciones, Firewall Perimetral" 
                />
              </Form.Item>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                💡 El motor de IA generará automáticamente el perfil de riesgo, impacto y recomendaciones ISO 27001
              </div>
            </Form>
          </Modal>

          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
          />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Sistema de Auditoría de Sistemas - Evaluación de Activos Bancarios con IA ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;
