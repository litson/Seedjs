# Seedjs

һ�����Խ�����js/css�ļ���ӵ�`localStorage`�й����js�⡣����ͬ����ļ�����Ҫ��Ӧ����������CORS��

# ����

�洢�ļ���`localStorage`���ɰ�����ʵ�ְ�����Ӧ�á�

```html
    
    <style data-seed='/path/to/file/a.css'></style>
    <script data-seed='/path/to/file/a.js'></script>
    
    <script>
        // �ڶ��ν���ʱ�������ᴥ������
        Seed.scan();
    </script>

```

��������

```html
    
        <style data-seed='/path/to/file/a.css?ver=timestamps'></style>
        <script data-seed='/path/to/file/a.js'></script>
        
        <script>
            // ʱ������º󣬱��ش洢��a.cssҲ��ͬ�������¡�
            Seed.scan();
        </script>

```

ͬ�����أ�����ִ��.

���õ��Ĵ����ִ��˳��ֻ���ṩһ������Ҫ���ļ��б�

```html

    <script data-seed='jquery.js'></script>
    <script data-seed='bootstrap.js'></script>

    <script>
        
        // bootstrap.js����jquery��
        // Seed�ڲ������ʱ�򣬻Ტ������bootstrap.js��jquery��
        // ����ִ�����ǵ�ʱ����ϸ���˳��
        
        Seed.scan();
    
    </script>

```


# API

