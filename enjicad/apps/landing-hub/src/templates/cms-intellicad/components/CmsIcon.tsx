import React from 'react';
import {
  Phone, Menu, X, Download, Sparkles, ChevronRight, Globe, Tag,
  CheckCircle, CheckCircle2, Monitor, Network, ShieldCheck, Layers,
  Award, Zap, Layout, FileCheck, Box, Code, Users, ArrowRight,
  FileText, Info, Check, Laptop, Cpu, HardDrive, MousePointer,
  FolderDown, CalendarCheck, HelpCircle, Search, ChevronDown,
  ChevronUp, AlertTriangle, MapPin, Mail, Clock, Lock, Send,
  ExternalLink, Bot, RefreshCw, User,
  type LucideProps
} from 'lucide-react';

interface CmsIconProps extends LucideProps {
  name: string;
}

export function CmsIcon({ name, className = 'h-4 w-4', ...props }: CmsIconProps) {
  switch (name) {
    case 'phone': return <Phone className={className} {...props} />;
    case 'menu': return <Menu className={className} {...props} />;
    case 'x': return <X className={className} {...props} />;
    case 'download': return <Download className={className} {...props} />;
    case 'sparkles': return <Sparkles className={className} {...props} />;
    case 'chevron-right': return <ChevronRight className={className} {...props} />;
    case 'globe': return <Globe className={className} {...props} />;
    case 'tag': return <Tag className={className} {...props} />;
    case 'check-circle': return <CheckCircle className={className} {...props} />;
    case 'check-circle-2': return <CheckCircle2 className={className} {...props} />;
    case 'monitor': return <Monitor className={className} {...props} />;
    case 'network': return <Network className={className} {...props} />;
    case 'shield-check': return <ShieldCheck className={className} {...props} />;
    case 'layers': return <Layers className={className} {...props} />;
    case 'award': return <Award className={className} {...props} />;
    case 'zap': return <Zap className={className} {...props} />;
    case 'layout': return <Layout className={className} {...props} />;
    case 'file-check': return <FileCheck className={className} {...props} />;
    case 'box': return <Box className={className} {...props} />;
    case 'code': return <Code className={className} {...props} />;
    case 'users': return <Users className={className} {...props} />;
    case 'arrow-right': return <ArrowRight className={className} {...props} />;
    case 'file-text': return <FileText className={className} {...props} />;
    case 'info': return <Info className={className} {...props} />;
    case 'check': return <Check className={className} {...props} />;
    case 'laptop': return <Laptop className={className} {...props} />;
    case 'cpu': return <Cpu className={className} {...props} />;
    case 'hard-drive': return <HardDrive className={className} {...props} />;
    case 'mouse-pointer': return <MousePointer className={className} {...props} />;
    case 'folder-down': return <FolderDown className={className} {...props} />;
    case 'calendar-check': return <CalendarCheck className={className} {...props} />;
    case 'help-circle': return <HelpCircle className={className} {...props} />;
    case 'search': return <Search className={className} {...props} />;
    case 'chevron-down': return <ChevronDown className={className} {...props} />;
    case 'chevron-up': return <ChevronUp className={className} {...props} />;
    case 'alert-triangle': return <AlertTriangle className={className} {...props} />;
    case 'map-pin': return <MapPin className={className} {...props} />;
    case 'mail': return <Mail className={className} {...props} />;
    case 'clock': return <Clock className={className} {...props} />;
    case 'lock': return <Lock className={className} {...props} />;
    case 'send': return <Send className={className} {...props} />;
    case 'external-link': return <ExternalLink className={className} {...props} />;
    case 'bot': return <Bot className={className} {...props} />;
    case 'refresh-cw': return <RefreshCw className={className} {...props} />;
    case 'user': return <User className={className} {...props} />;
    default: return <Sparkles className={className} {...props} />;
  }
}
