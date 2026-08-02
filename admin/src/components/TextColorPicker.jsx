import { ColorPicker, Button, Space, Tooltip } from 'antd';
import { FontColorsOutlined } from '@ant-design/icons';

/**
 * 文字颜色选择器 - 可放在任意输入框旁边
 * value: hex string or ''
 * onChange: (hex string) => void
 */
export default function TextColorPicker({ value = '', onChange, tooltip = '文字颜色' }) {
  return (
    <Tooltip title={tooltip}>
      <Space size={4}>
        <ColorPicker
          value={value || undefined}
          onChange={(color) => onChange(color?.toHexString?.() || '')}
          showText
          format="hex"
          disabledAlpha
        />
        {value && (
          <Button
            size="small"
            type="text"
            icon={<FontColorsOutlined />}
            onClick={() => onChange('')}
            style={{ color: '#999' }}
          />
        )}
      </Space>
    </Tooltip>
  );
}
